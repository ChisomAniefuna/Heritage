import React, { useState, useEffect } from 'react';
import { Clock, Brain, Heart, CheckCircle, XCircle, RotateCcw, Award, Target } from 'lucide-react';
import { KnowledgeVerification, Flashcard, KnowledgeTestResult, TestAnswer } from '../types';

interface KnowledgeTestInterfaceProps {
  verification: KnowledgeVerification;
  beneficiaryName: string;
  assetName: string;
  onTestComplete: (result: KnowledgeTestResult) => void;
  onClose: () => void;
  previousAttempts?: number;
}

const KnowledgeTestInterface: React.FC<KnowledgeTestInterfaceProps> = ({
  verification,
  beneficiaryName,
  assetName,
  onTestComplete,
  onClose,
  previousAttempts = 0
}) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(verification.timeLimit ? verification.timeLimit * 60 : 1800);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testResult, setTestResult] = useState<KnowledgeTestResult | null>(null);

  const currentFlashcard = verification.flashcards[currentQuestionIndex];
  const totalQuestions = verification.flashcards.length;
  const attemptsRemaining = verification.maxAttempts - previousAttempts;

  useEffect(() => {
    if (currentStep === 'test' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, timeRemaining]);

  const startTest = () => {
    setCurrentStep('test');
    setTestStartTime(new Date());
    setTimeRemaining(verification.timeLimit ? verification.timeLimit * 60 : 1800);
  };

  const handleTimeUp = () => {
    // Auto-submit current answers
    finishTest();
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const flashcard = currentFlashcard;
    const isCorrect = checkAnswer(currentAnswer, flashcard.correctAnswer);
    const pointsEarned = isCorrect ? flashcard.points : 0;

    const testAnswer: TestAnswer = {
      flashcardId: flashcard.id,
      userAnswer: currentAnswer,
      isCorrect,
      pointsEarned,
      timeSpent: 30, // Could track actual time per question
      attempts: 1
    };

    setAnswers(prev => [...prev, testAnswer]);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setCurrentAnswer('');
    setShowExplanation(false);
    
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string | string[]): boolean => {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(answer => 
        userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
      );
    }
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const finishTest = () => {
    const totalPoints = verification.flashcards.reduce((sum, card) => sum + card.points, 0);
    const earnedPoints = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= verification.passingScore;

    const result: KnowledgeTestResult = {
      id: Date.now().toString(),
      testId: verification.id,
      beneficiaryId: 'current-user', // Would be actual beneficiary ID
      assetId: 'current-asset', // Would be actual asset ID
      attemptNumber: previousAttempts + 1,
      startTime: testStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      score,
      totalPoints,
      passed,
      answers,
      categoryScores: [], // Would calculate category-specific scores
      timeSpent: verification.timeLimit ? (verification.timeLimit * 60) - timeRemaining : 0,
      status: 'completed'
    };

    setTestResult(result);
    setCurrentStep('results');
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderIntro = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Brain className="w-10 h-10 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Knowledge Verification Required
        </h3>
        <p className="text-lg text-slate-600 mb-4">
          Before accessing <strong>{assetName}</strong>, you need to complete this knowledge test.
        </p>
        <p className="text-slate-600">
          This test was designed to ensure you've learned important life lessons and family values.
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h4 className="font-semibold text-slate-900 mb-3">Test Details:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className="font-medium">{totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span>Time Limit:</span>
            <span className="font-medium">{verification.timeLimit} minutes</span>
          </div>
          <div className="flex justify-between">
            <span>Passing Score:</span>
            <span className="font-medium">{verification.passingScore}%</span>
          </div>
          <div className="flex justify-between">
            <span>Attempts Remaining:</span>
            <span className="font-medium">{attemptsRemaining}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-purple-800 text-sm">
          <strong>Remember:</strong> This test includes wisdom and values that are important to your family. 
          Take your time to think about each question carefully.
        </p>
      </div>

      <div className="flex space-x-4 justify-center">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
        >
          Not Ready Yet
        </button>
        <button
          onClick={startTest}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Brain className="w-5 h-5" />
          <span>Start Test</span>
        </button>
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
            <span>Category: {verification.categories?.find(c => c.id === currentFlashcard.categoryId)?.name}</span>
            <span>Points: {currentFlashcard.points}</span>
            <span>Difficulty: {currentFlashcard.difficulty}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-slate-600" />
          <span className={`font-medium ${timeRemaining < 300 ? 'text-red-600' : 'text-slate-900'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-slate-900 mb-4">
          {currentFlashcard.question}
        </h4>

        {/* Answer Input */}
        {!showExplanation && (
          <div className="space-y-4">
            {currentFlashcard.questionType === 'multiple_choice' && (
              <div className="space-y-2">
                {currentFlashcard.options?.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={currentAnswer === option}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentFlashcard.questionType === 'true_false' && (
              <div className="space-y-2">
                {['True', 'False'].map(option => (
                  <label key={option} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={currentAnswer === option}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentFlashcard.questionType === 'short_answer' || currentFlashcard.questionType === 'essay') && (
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={currentFlashcard.questionType === 'essay' ? 6 : 3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Type your answer here..."
              />
            )}

            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              answers[answers.length - 1]?.isCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {answers[answers.length - 1]?.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  answers[answers.length - 1]?.isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {answers[answers.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Your answer:</strong> {currentAnswer}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Correct answer:</strong> {currentFlashcard.correctAnswer}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
              <p className="text-blue-800 text-sm">{currentFlashcard.explanation}</p>
            </div>

            {currentFlashcard.parentalWisdom && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <h5 className="font-medium text-purple-900">Parental Wisdom:</h5>
                </div>
                <p className="text-purple-800 text-sm italic">"{currentFlashcard.parentalWisdom}"</p>
              </div>
            )}

            {currentFlashcard.lifeLesson && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-600" />
                  <h5 className="font-medium text-yellow-900">Life Lesson:</h5>
                </div>
                <p className="text-yellow-800 text-sm">{currentFlashcard.lifeLesson}</p>
              </div>
            )}

            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!testResult) return null;

    const passed = testResult.passed;
    const canRetry = attemptsRemaining > 1;

    return (
      <div className="text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
          passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {passed ? (
            <Award className="w-10 h-10 text-green-600" />
          ) : (
            <RotateCcw className="w-10 h-10 text-red-600" />
          )}
        </div>

        <div>
          <h3 className={`text-2xl font-bold mb-3 ${passed ? 'text-green-900' : 'text-red-900'}`}>
            {passed ? 'Congratulations!' : 'Test Not Passed'}
          </h3>
          <p className="text-lg text-slate-600 mb-4">
            You scored <strong>{testResult.score}%</strong> on the knowledge test.
          </p>
          {passed ? (
            <p className="text-green-700">
              You've demonstrated the knowledge and values needed to access <strong>{assetName}</strong>.
            </p>
          ) : (
            <p className="text-red-700">
              You need {verification.passingScore}% to pass. {canRetry ? 'You can try again.' : 'No more attempts remaining.'}
            </p>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="font-semibold text-slate-900 mb-3">Test Summary:</h4>
          <div className="space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-medium">{testResult.score}%</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-medium">{answers.filter(a => a.isCorrect).length} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Used:</span>
              <span className="font-medium">{formatTime(testResult.timeSpent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Attempt:</span>
              <span className="font-medium">{testResult.attemptNumber} / {verification.maxAttempts}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          {!passed && canRetry && (
            <button
              onClick={() => {
                setCurrentStep('intro');
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setCurrentAnswer('');
                setShowExplanation(false);
                setTestResult(null);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          )}
          
          <button
            onClick={() => onTestComplete(testResult)}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              passed 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {passed ? (
              <>
                <Award className="w-5 h-5" />
                <span>Access Asset</span>
              </>
            ) : (
              <span>Close</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{verification.title}</h2>
            <p className="text-slate-600 text-sm mt-1">{verification.description}</p>
          </div>
          {currentStep !== 'test' && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="p-6">
          {currentStep === 'intro' && renderIntro()}
          {currentStep === 'test' && renderTest()}
          {currentStep === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeTestInterface;