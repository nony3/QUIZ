import React, {Component, Fragment} from 'react';
import { BsChevronRight } from "react-icons/bs";
import Levels from '../Levels';
import ProgressBar from '../ProgressBar';
import {QuizMarvel} from '../quizMarvel';
import QuizOver from '../QuizOver';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

toast.configure();

const initialState = {
    quizLevel: 0,
    maxQuestions: 10,
    storedQuestions: [],
    question: null,
    options: [],
    idQuestion: 0,
    btnDisabled: true,
    userAnswer: null,
    score: 0,
    showWelcomeMsg: false,
    quizEnd: false,
    percent: null
}

const levelNames = ["debutant", "confirme", "expert"];

class Quiz extends Component{
    constructor(props) {
        super(props)
        this.state = initialState;
        this.storedDataRef = React.createRef();
    }
   

    

    loadQuestions = quizz => {

        const fetchedArrayQuiz = QuizMarvel[0].quizz[quizz];

        if (fetchedArrayQuiz.length >= this.state.maxQuestions) {

           this.storedDataRef.current = fetchedArrayQuiz;
           const newArray = fetchedArrayQuiz.map( ({answer,...keepRest}) => keepRest);
           this.setState({ storedQuestions: newArray })

        } 

    }


    showToastMsg = pseudo => {
        if (!this.state.showWelcomeMsg) {

            this.setState({
                showWelcomeMsg:true
            })
            toast.warn(`Bienvenue ${pseudo}, et bonne chance !`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false, 
                progress: undefined              
                });
        }
    }


    componentDidMount() {
        this.loadQuestions(levelNames[this.state.quizLevel])
    }

    nextQuestion= () => {
        if (this.state.idQuestion === this.state.maxQuestions - 1) {
            this.setState({
                quizEnd: true
            })
        } else {
            this.setState(prevState => ({
                idQuestion: prevState.idQuestion + 1
            }))
        }
        const goodAnswer = this.storedDataRef.current[this.state.idQuestion].answer;
        if (this.state.userAnswer === goodAnswer) {
            this.setState( prevState=>  ({
                score: prevState.score + 1
            }))

            toast.success('Bravo +1 !', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                bodyClassName: "toastify-color",
                });

        } else {
            toast.error('Raté 0 !', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                bodyClassName: "toastify-color",
                });
        }
    }

    componentDidUpdate(prevProps, prevState) {

        const {
            maxQuestions,
            storedQuestions,
            idQuestion,
            quizEnd,
            score
        } = this.state;

        if ((storedQuestions !== prevState.storedQuestions) && storedQuestions.length) {
            this.setState({
                question: storedQuestions[idQuestion].question,
                options: storedQuestions[idQuestion].options
            })
        }
        if ((idQuestion !== prevState.idQuestion) && storedQuestions.length){
            this.setState({
                question: storedQuestions[idQuestion].question,
                options: storedQuestions[idQuestion].options,
                userAnswer: null,
                btnDisabled:true
            })
        }

        if (quizEnd !== prevState.quizEnd) {
            const gradepercent = this.getPercentage(maxQuestions, score)
            this.gameOver(gradepercent);
        }

        if (this.props.userData.pseudo !== prevProps.userData.pseudo){
            this.showToastMsg(this.props.userData.pseudo)
        }

    }

    submitAnswer= selectedAnswer => {
        this.setState({
            userAnswer: selectedAnswer,
            btnDisabled: false
        })
    }

    getPercentage = (maxQuest, ourScore) =>(ourScore / maxQuest) * 100;

    gameOver = percent => {

        const gradepercent = this.getPercentage(this.state.maxQuestions, this.state.score);

        if (percent >= 50) {
            this.setState({
                quizLevel: this.state.quizLevel + 1,
                percent
                
            })
        } else {
            this.setState({
                percent
            })
        }

        
    }

    loadLevelQuestions = param => {
        this.setState({...initialState, quizLevel: param})

        this.loadQuestions(levelNames[param]);
    }

    render() {
        
        const {
            quizLevel,
            maxQuestions,
            question,
            options,
            idQuestion,
            btnDisabled,
            userAnswer,
            score,
            quizEnd,
            percent
        } = this.state;

        const displayOptions = options.map((option, index) => {
            return (
                <p key={index} 
                className={`answerOptions ${userAnswer === option ? "selected": null}`}
                onClick={() => this.submitAnswer(option)}
                >
                    <BsChevronRight /> {option}
                    </p>
            )
        })
// Condition d'affichage du quiz (?)
        return quizEnd ? (
            <QuizOver
                ref={this.storedDataRef}
                levelNames={levelNames}
                score={score}
                maxQuestions={maxQuestions}
                quizLevel={quizLevel}
                percent={percent} 
                loadLevelQuestions={this.loadLevelQuestions}
            />
        )
//Sinon (:)
        :
        (
            <Fragment>
            <Levels 
                levelNames={levelNames}
                quizLevel={quizLevel}
                />
            <ProgressBar 
                idQuestion={idQuestion}
                maxQuestions={maxQuestions}
                />
            <h2>{question}</h2>
             {displayOptions}
            <button 
            disabled={btnDisabled}
            className="btnSubmit"
            onClick={this.nextQuestion}
            >
            {idQuestion < maxQuestions - 1 ? "Suivant" : "Terminé"}
            </button>
        </Fragment>       
        )
        
    

    }
}

export default Quiz;