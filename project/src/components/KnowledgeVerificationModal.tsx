import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Edit, Play, BookOpen, Target, Clock, Award, Heart, Lightbulb, Globe } from 'lucide-react';
import { KnowledgeVerification, Flashcard, KnowledgeCategory } from '../types';

interface KnowledgeVerificationModalProps {
  assetName: string;
  beneficiaryName: string;
  onSave: (verification: Omit<KnowledgeVerification, 'id' | 'createdDate' | 'lastUpdated'>) => void;
  onClose: () => void;
  existingVerification?: KnowledgeVerification;
}

const KnowledgeVerificationModal: React.FC<KnowledgeVerificationModalProps> = ({
  assetName,
  beneficiaryName,
  onSave,
  onClose,
  existingVerification
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [verification, setVerification] = useState<Partial<KnowledgeVerification>>({
    title: existingVerification?.title || `Knowledge Test for ${assetName}`,
    description: existingVerification?.description || `Essential knowledge and values test before accessing ${assetName}`,
    isRequired: existingVerification?.isRequired ?? true,
    passingScore: existingVerification?.passingScore || 80,
    maxAttempts: existingVerification?.maxAttempts || 3,
    timeLimit: existingVerification?.timeLimit || 30,
    categories: existingVerification?.categories || [],
    flashcards: existingVerification?.flashcards || []
  });

  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [showFlashcardForm, setShowFlashcardForm] = useState(false);

  const defaultCategories: KnowledgeCategory[] = [
    {
      id: 'family_values',
      name: 'Family Values & Heritage',
      description: 'Understanding family history, values, and cultural heritage',
      weight: 25,
      color: 'bg-red-100 text-red-800',
      icon: 'Heart'
    },
    {
      id: 'financial_wisdom',
      name: 'Financial Responsibility',
      description: 'Money management, investment principles, and financial planning',
      weight: 25,
      color: 'bg-green-100 text-green-800',
      icon: 'Target'
    },
    {
      id: 'life_skills',
      name: 'Life Skills & Character',
      description: 'Essential life skills, character development, and personal growth',
      weight: 25,
      color: 'bg-blue-100 text-blue-800',
      icon: 'Lightbulb'
    },
    {
      id: 'cultural_knowledge',
      name: 'Cultural & Spiritual Wisdom',
      description: 'Cultural traditions, spiritual values, and community responsibility',
      weight: 25,
      color: 'bg-purple-100 text-purple-800',
      icon: 'Globe'
    }
  ];

  const sampleFlashcards: Partial<Flashcard>[] = [
    {
      categoryId: 'family_values',
      question: 'What was the most important lesson your grandmother taught our family?',
      questionType: 'short_answer',
      correctAnswer: 'Always help others in need, even when you have little yourself',
      explanation: 'This reflects our family\'s core value of generosity and community support.',
      difficulty: 'medium',
      points: 10,
      parentalWisdom: 'Your grandmother lived through difficult times but never lost her compassion. This lesson shaped who we are as a family.',
      lifeLesson: 'True wealth comes from what you give, not what you keep.'
    },
    {
      categoryId: 'financial_wisdom',
      question: 'Before making a major purchase, you should:',
      questionType: 'multiple_choice',
      options: [
        'Buy it immediately if you want it',
        'Wait 24 hours and consider if it aligns with your goals',
        'Ask friends for their opinion',
        'Only consider the monthly payment'
      ],
      correctAnswer: 'Wait 24 hours and consider if it aligns with your goals',
      explanation: 'Thoughtful decision-making prevents impulse purchases and ensures financial stability.',
      difficulty: 'easy',
      points: 5,
      parentalWisdom: 'I learned this lesson the hard way. Every dollar you spend is a choice about your future.',
      lifeLesson: 'Patience in spending leads to abundance in life.'
    },
    {
      categoryId: 'life_skills',
      question: 'When facing a difficult decision, what process should you follow?',
      questionType: 'essay',
      correctAnswer: 'Consider your values, gather information, think about consequences, seek wise counsel, and trust your judgment',
      explanation: 'Good decision-making is a skill that improves with practice and reflection.',
      difficulty: 'hard',
      points: 15,
      parentalWisdom: 'Life will present you with many crossroads. The process matters more than being perfect.',
      lifeLesson: 'Wisdom comes from learning to make decisions that align with your deepest values.'
    }
  ];

  const addCategory = () => {
    const newCategory: KnowledgeCategory = {
      id: Date.now().toString(),
      name: 'New Category',
      description: 'Description for new category',
      weight: 25,
      color: 'bg-slate-100 text-slate-800',
      icon: 'BookOpen'
    };
    setVerification(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCategory]
    }));
  };

  const updateCategory = (categoryId: string, updates: Partial<KnowledgeCategory>) => {
    setVerification(prev => ({
      ...prev,
      categories: prev.categories?.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ) || []
    }));
  };

  const removeCategory = (categoryId: string) => {
    setVerification(prev => ({
      ...prev,
      categories: prev.categories?.filter(cat => cat.id !== categoryId) || [],
      flashcards: prev.flashcards?.filter(card => card.categoryId !== categoryId) || []
    }));
  };

  const addFlashcard = (flashcard: Omit<Flashcard, 'id'>) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: Date.now().toString()
    };
    setVerification(prev => ({
      ...prev,
      flashcards: [...(prev.flashcards || []), newFlashcard]
    }));
    setShowFlashcardForm(false);
    setEditingFlashcard(null);
  };

  const updateFlashcard = (flashcardId: string, updates: Partial<Flashcard>) => {
    setVerification(prev => ({
      ...prev,
      flashcards: prev.flashcards?.map(card => 
        card.id === flashcardId ? { ...card, ...updates } : card
      ) || []
    }));
    setShowFlashcardForm(false);
    setEditingFlashcard(null);
  };

  const removeFlashcard = (flashcardId: string) => {
    setVerification(prev => ({
      ...prev,
      flashcards: prev.flashcards?.filter(card => card.id !== flashcardId) || []
    }));
  };

  const loadSampleData = () => {
    setVerification(prev => ({
      ...prev,
      categories: defaultCategories,
      flashcards: sampleFlashcards.map((card, index) => ({
        ...card,
        id: (Date.now() + index).toString(),
        tags: ['sample'],
        culturalContext: 'Universal family values'
      })) as Flashcard[]
    }));
  };

  const handleSave = () => {
    if (!verification.title || !verification.categories?.length || !verification.flashcards?.length) {
      alert('Please complete all required fields');
      return;
    }

    onSave(verification as Omit<KnowledgeVerification, 'id' | 'createdDate' | 'lastUpdated'>);
  };

  const FlashcardForm: React.FC<{ 
    flashcard?: Flashcard; 
    onSave: (flashcard: Omit<Flashcard, 'id'>) => void;
    onCancel: () => void;
  }> = ({ flashcard, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Flashcard>>({
      categoryId: flashcard?.categoryId || verification.categories?.[0]?.id || '',
      question: flashcard?.question || '',
      questionType: flashcard?.questionType || 'multiple_choice',
      options: flashcard?.options || ['', '', '', ''],
      correctAnswer: flashcard?.correctAnswer || '',
      explanation: flashcard?.explanation || '',
      difficulty: flashcard?.difficulty || 'medium',
      points: flashcard?.points || 10,
      parentalWisdom: flashcard?.parentalWisdom || '',
      lifeLesson: flashcard?.lifeLesson || '',
      culturalContext: flashcard?.culturalContext || '',
      tags: flashcard?.tags || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (flashcard) {
        updateFlashcard(flashcard.id, formData);
      } else {
        onSave(formData as Omit<Flashcard, 'id'>);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              {flashcard ? 'Edit' : 'Add'} Flashcard
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {verification.categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Question Type</label>
                <select
                  value={formData.questionType}
                  onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                  <option value="scenario">Scenario</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {formData.questionType === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                {formData.options?.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])];
                      newOptions[index] = e.target.value;
                      setFormData(prev => ({ ...prev, options: newOptions }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Explanation</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy (5 points)</option>
                  <option value="medium">Medium (10 points)</option>
                  <option value="hard">Hard (15 points)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-purple-900 flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Parental Wisdom & Life Lessons</span>
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Parental Wisdom</label>
                <textarea
                  value={formData.parentalWisdom}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentalWisdom: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Personal message or wisdom you want to share..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Life Lesson</label>
                <textarea
                  value={formData.lifeLesson}
                  onChange={(e) => setFormData(prev => ({ ...prev, lifeLesson: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="What life lesson does this question teach?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Cultural Context</label>
                <input
                  type="text"
                  value={formData.culturalContext}
                  onChange={(e) => setFormData(prev => ({ ...prev, culturalContext: e.target.value }))}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Cultural or family significance..."
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {flashcard ? 'Update' : 'Add'} Flashcard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Knowledge Verification Setup</h3>
              </div>
              <p className="text-blue-800 mb-4">
                Create a meaningful test that ensures {beneficiaryName} has learned important life lessons 
                and family values before accessing {assetName}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <Award className="w-5 h-5 text-green-600 mb-2" />
                  <p className="font-medium">Educational</p>
                  <p className="text-slate-600">Teaches important life skills</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600 mb-2" />
                  <p className="font-medium">Values-Based</p>
                  <p className="text-slate-600">Reinforces family values</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 mb-2" />
                  <p className="font-medium">Goal-Oriented</p>
                  <p className="text-slate-600">Encourages personal growth</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Test Title</label>
                <input
                  type="text"
                  value={verification.title}
                  onChange={(e) => setVerification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  value={verification.passingScore}
                  onChange={(e) => setVerification(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="50"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Attempts</label>
                <input
                  type="number"
                  value={verification.maxAttempts}
                  onChange={(e) => setVerification(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={verification.timeLimit}
                  onChange={(e) => setVerification(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={verification.description}
                onChange={(e) => setVerification(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Explain the purpose and importance of this knowledge test..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Knowledge Categories</h3>
              <div className="flex space-x-2">
                <button
                  onClick={loadSampleData}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                >
                  Load Sample Categories
                </button>
                <button
                  onClick={addCategory}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verification.categories?.map(category => (
                <div key={category.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${category.color}`}>
                      {category.name}
                    </div>
                    <button
                      onClick={() => removeCategory(category.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm mb-2"
                    placeholder="Category name"
                  />
                  
                  <textarea
                    value={category.description}
                    onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm mb-2"
                    placeholder="Category description"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-600">Weight:</label>
                    <input
                      type="number"
                      value={category.weight}
                      onChange={(e) => updateCategory(category.id, { weight: parseInt(e.target.value) })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-xs"
                      min="0"
                      max="100"
                    />
                    <span className="text-xs text-slate-600">%</span>
                  </div>
                </div>
              ))}
            </div>

            {verification.categories?.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No categories yet. Add categories to organize your questions.</p>
                <button
                  onClick={loadSampleData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Load Sample Categories
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Flashcards & Questions</h3>
              <button
                onClick={() => setShowFlashcardForm(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Flashcard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {verification.flashcards?.map(flashcard => {
                const category = verification.categories?.find(c => c.id === flashcard.categoryId);
                return (
                  <div key={flashcard.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${category?.color || 'bg-slate-100 text-slate-800'}`}>
                            {category?.name || 'Unknown Category'}
                          </span>
                          <span className="text-xs text-slate-500">{flashcard.difficulty} • {flashcard.points} pts</span>
                        </div>
                        <p className="font-medium text-slate-900 text-sm mb-2">{flashcard.question}</p>
                        {flashcard.parentalWisdom && (
                          <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-2">
                            <p className="text-xs text-purple-800">
                              <strong>Parental Wisdom:</strong> {flashcard.parentalWisdom}
                            </p>
                          </div>
                        )}
                        {flashcard.lifeLesson && (
                          <p className="text-xs text-blue-700">
                            <strong>Life Lesson:</strong> {flashcard.lifeLesson}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingFlashcard(flashcard);
                            setShowFlashcardForm(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFlashcard(flashcard.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {verification.flashcards?.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No flashcards yet. Add questions to test knowledge and values.</p>
                <button
                  onClick={() => setShowFlashcardForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Flashcard
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Knowledge Verification Setup</h2>
            <p className="text-slate-600 mt-1">Create meaningful tests that teach life lessons</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Step {currentStep}: {
              currentStep === 1 ? 'Basic Settings' :
              currentStep === 2 ? 'Knowledge Categories' :
              'Flashcards & Questions'
            }
          </div>
        </div>

        <div className="p-6">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 2 && !verification.categories?.length}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!verification.flashcards?.length}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                >
                  Create Knowledge Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFlashcardForm && (
        <FlashcardForm
          flashcard={editingFlashcard || undefined}
          onSave={addFlashcard}
          onCancel={() => {
            setShowFlashcardForm(false);
            setEditingFlashcard(null);
          }}
        />
      )}
    </div>
  );
};

export default KnowledgeVerificationModal;