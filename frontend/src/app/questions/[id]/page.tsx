'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import { answerService } from '@/services/answer.service';
import { Question } from '@/types/question';
import { Answer } from '@/types/answer';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiThumbsUp, FiThumbsDown, FiCheckCircle, FiBookmark, FiMessageCircle, FiPlus, FiUpload, FiX, FiImage, FiFile, FiZoomIn, FiXCircle, FiTrash2 } from 'react-icons/fi';

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, loadAuth, refreshUser } = useAuthStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadQuestion();
    loadAnswers();
  }, [isAuthenticated, router, params.id]);

  const loadQuestion = async () => {
    try {
      const data = await questionService.getQuestionById(params.id as string);
      setQuestion(data);
    } catch (error) {
      toast.error('Failed to load question');
      router.push('/questions');
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const data = await answerService.getAnswersByQuestion(params.id as string);
      setAnswers(data);
    } catch (error) {
      console.error('Failed to load answers:', error);
      toast.error('Failed to load answers');
    }
  };

  const handleAnswerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit to 5 files total
      setAnswerFiles([...answerFiles, ...newFiles].slice(0, 5));
    }
  };

  const removeAnswerFile = (index: number) => {
    setAnswerFiles(answerFiles.filter((_, i) => i !== index));
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim() && answerFiles.length === 0) return;

    setSubmittingAnswer(true);
    try {
      await answerService.createAnswer({
        questionId: params.id as string,
        content: answerContent,
        files: answerFiles.length > 0 ? answerFiles : undefined,
      });
      toast.success('Answer posted successfully!');
      setAnswerContent('');
      setAnswerFiles([]);
      loadAnswers();
      loadQuestion();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVote = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await answerService.voteAnswer(answerId, voteType);
      loadAnswers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to vote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await answerService.acceptAnswer(answerId, params.id as string);
      toast.success('Answer accepted!');
      loadQuestion();
      loadAnswers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept answer');
    }
  };

  const handleDeleteQuestion = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteQuestion = async () => {
    setIsDeleting(true);
    try {
      await questionService.deleteQuestion(params.id as string);
      toast.success('Question deleted successfully');
      router.push('/questions');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete question');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Role-based answer acceptance permissions
  const isQuestionOwner = user?.id === question?.userId;
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const canAcceptAnswer = isQuestionOwner || isTeacher || isAdmin;

  if (!isAuthenticated || loading) return null;
  if (!question) return null;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/questions"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Questions
        </Link>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
                {question.isSolved && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                    <FiCheckCircle className="w-4 h-4" />
                    Solved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="font-medium">{question.authorName}</span>
                <span>•</span>
                <span>{question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 'Recently'}</span>
                {question.subject && (
                  <>
                    <span>•</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {question.subject}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right text-sm text-gray-500">
                <div>{question.views} views</div>
                <div>{answers.length} answers</div>
              </div>
              {isQuestionOwner && (
                <button
                  onClick={handleDeleteQuestion}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  title="Delete question"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {question.description && (
            <div className="prose max-w-none mb-6">
              <ReactMarkdown>{question.description}</ReactMarkdown>
            </div>
          )}
          {!question.description && (
            <div className="text-sm text-gray-500 italic mb-6">No description provided</div>
          )}

          {question.images && question.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {question.images.map((image) => {
                // Ensure image URL uses backend API URL
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';
                const backendBaseUrl = apiUrl.replace('/api', '');
                // Handle both absolute and relative URLs
                let imageUrl = image.imageUrl || '';
                if (!imageUrl.startsWith('http')) {
                  imageUrl = `${backendBaseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
                }
                return (
                  <div key={image.id} className="relative group">
                    <img
                      src={imageUrl}
                      alt={image.fileName || 'Question image'}
                      className="rounded-lg border border-gray-200 w-full h-48 object-cover cursor-pointer"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        // Show placeholder instead of hiding
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                        Click to view full size
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h2>
          
          {/* Rejection Warning for Teachers */}
          {user?.role === 'teacher' && user?.isActive === false && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    <strong>Account Rejected:</strong> Your teacher account has been rejected. You cannot answer questions or perform teacher operations. Please contact an administrator.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Verification Warning for Teachers */}
          {user?.role === 'teacher' && !user?.isVerified && user?.isActive !== false && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Account Pending Verification:</strong> Your teacher account is pending admin approval. 
                    You will be able to answer questions once your account is verified.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 resize-none mb-4"
              placeholder="Write your answer here. Markdown is supported."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
            />
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Attach Files (Optional) - Images or PDFs
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="answer-files"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleAnswerFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="answer-files"
                  className="cursor-pointer flex flex-col items-center justify-center py-4"
                >
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images or PDFs (max 5 files, 10MB each)
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP, PDF, DOC, DOCX
                  </span>
                </label>
              </div>
              
              {/* File Preview */}
              {answerFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {answerFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? (
                          <FiImage className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FiFile className="w-5 h-5 text-purple-500" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnswerFile(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                submittingAnswer || 
                (!answerContent.trim() && answerFiles.length === 0) ||
                (user?.role === 'teacher' && (!user?.isVerified || user?.isActive === false))
              }
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              {submittingAnswer ? 'Posting...' : 
               user?.role === 'teacher' && user?.isActive === false ? 'Account Rejected' :
               user?.role === 'teacher' && !user?.isVerified ? 'Verification Required' : 
               'Post Answer'}
            </button>
          </form>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {answers.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              No answers yet. Be the first to answer!
            </div>
          ) : (
            answers.map((answer) => {
              // Extract content outside JSX for better debugging
              const rawContent = answer.content ?? 
                                 (answer as any).contentText ?? 
                                 (answer as any).content_text ?? 
                                 '';
              // Convert to string and trim - handle all edge cases
              let contentStr = '';
              if (rawContent !== null && rawContent !== undefined) {
                contentStr = String(rawContent).trim();
              }
              
              return (
                <div
                  key={answer.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  answer.isAccepted
                    ? 'border-green-500 bg-green-50/30'
                    : answer.isPinned
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-gray-100'
                }`}
              >
                {/* View Answer Link */}
                <div className="mb-4 flex items-center justify-end">
                  <Link
                    href={`/answers/${answer.id}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    View Full Answer
                  </Link>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {answer.authorName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{answer.authorName}</span>
                        {answer.authorRole === 'teacher' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            🟢 Teacher
                          </span>
                        )}
                        {answer.authorRole === 'student' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            🔵 Student
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {answer.createdAt ? formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {answer.isAccepted && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        ⭐ Accepted
                      </span>
                    )}
                    {answer.isPinned && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1">
                        <FiBookmark className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                  </div>
                </div>

                {/* Answer Content - RENDER DIRECTLY */}
                {contentStr && contentStr.length > 0 ? (
                  <div className="mb-4">
                    <div className="prose max-w-none text-gray-900">
                      <ReactMarkdown>{contentStr}</ReactMarkdown>
                    </div>
                  </div>
                ) : answer.files && answer.files.length > 0 ? (
                  <div className="mb-4 text-sm text-gray-500 italic">No text content provided</div>
                ) : (
                  <div className="mb-4 text-sm text-gray-500 italic">No content available</div>
                )}

                {/* Answer Files */}
                {answer.files && answer.files.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiFile className="w-4 h-4" />
                      Attachments ({answer.files.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {answer.files && answer.files.length > 0 && answer.files.map((file) => {
                        // Construct full file URL - backend provides the correct path in fileUrl
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';
                        const backendBaseUrl = apiUrl.replace('/api', '');
                        let fileUrl = file.fileUrl || '';
                        
                        // Handle relative paths - backend provides correct path, just prepend base URL
                        if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                          // Backend provides path like /uploads/images/... or /uploads/documents/...
                          // Use it directly - don't guess the path!
                          if (fileUrl.startsWith('/uploads/')) {
                            fileUrl = `${backendBaseUrl}${fileUrl}`;
                          } else if (fileUrl.startsWith('uploads/')) {
                            fileUrl = `${backendBaseUrl}/${fileUrl}`;
                          } else {
                            // Fallback: if no path, determine based on file type
                            const isImage = file.fileType === 'image' || 
                              file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            const uploadPath = isImage ? '/uploads/images/' : '/uploads/documents/';
                            fileUrl = `${backendBaseUrl}${uploadPath}${fileUrl.replace(/^\/+/, '')}`;
                          }
                        }
                        
                        // Determine if file is an image - check fileType and extension
                        // Note: Images can be stored in either /uploads/images/ or /uploads/documents/
                        // depending on the fieldname used during upload, but we display them as images
                        // if they have an image extension or fileType='image'
                        const hasImageExtension = file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                                                  fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isImage = file.fileType === 'image' || hasImageExtension;
                        
                        // If file has image extension but is in documents folder, that's fine - use the actual path
                        // The file is physically stored where it was uploaded, we just need to display it correctly
                        
                        return isImage ? (
                          <div 
                            key={file.id} 
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedImage(fileUrl)}
                          >
                            <img
                              src={fileUrl}
                              alt={file.fileName || 'Answer attachment'}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                
                                // If image fails, try the other folder (images <-> documents)
                                const fileName = fileUrl.split('/').pop() || '';
                                if (fileUrl.includes('/documents/') && file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                                  // Try images folder
                                  const fallbackUrl = `${backendBaseUrl}/uploads/images/${fileName}`;
                                  if (img.src !== fallbackUrl) {
                                    img.src = fallbackUrl;
                                    return;
                                  }
                                } else if (fileUrl.includes('/images/') && file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                                  // Try documents folder
                                  const fallbackUrl = `${backendBaseUrl}/uploads/documents/${fileName}`;
                                  if (img.src !== fallbackUrl) {
                                    img.src = fallbackUrl;
                                    return;
                                  }
                                }
                                
                                // Show placeholder if all attempts fail
                                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg pointer-events-none">
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-white">
                                <FiZoomIn className="w-5 h-5" />
                                <span className="text-sm font-medium">Click to view</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <a
                            key={file.id}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-green-50 transition-all"
                          >
                            <FiFile className="w-6 h-6 text-purple-500 mb-2" />
                            <div className="text-sm font-medium text-gray-900 truncate" title={file.fileName || 'File'}>
                              {file.fileName || 'File'}
                            </div>
                            <div className="text-xs text-gray-500">{file.fileType || 'document'}</div>
                          </a>
                        );
                      })}
                    </div>
                    {answer.files.length > 4 && (
                      <div className="mt-3 text-sm text-gray-600">
                        <Link 
                          href={`/answers/${answer.id}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          View all {answer.files.length} attachments →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleVote(answer.id, 'upvote')}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <FiThumbsUp className="w-5 h-5" />
                    <span className="font-semibold">{answer.upvotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(answer.id, 'downvote')}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <FiThumbsDown className="w-5 h-5" />
                    <span className="font-semibold">{answer.downvotes}</span>
                  </button>
                  {canAcceptAnswer && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-sm"
                    >
                      Accept Answer
                    </button>
                  )}
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70"
              aria-label="Close"
            >
              <FiXCircle className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('Modal image load error:', selectedImage);
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isDeleting}
      />
    </div>
  );
}

