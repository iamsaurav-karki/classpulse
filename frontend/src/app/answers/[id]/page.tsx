'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { answerService } from '@/services/answer.service';
import { questionService } from '@/services/question.service';
import { Answer } from '@/types/answer';
import { Question } from '@/types/question';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiThumbsUp, 
  FiThumbsDown, 
  FiCheckCircle, 
  FiBookmark, 
  FiZoomIn, 
  FiXCircle,
  FiFile,
  FiUser,
  FiMessageCircle
} from 'react-icons/fi';

export default function AnswerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (params.id) {
      loadAnswer();
    }
  }, [isAuthenticated, router, params.id]);

  const loadAnswer = async () => {
    try {
      setLoading(true);
      const answerData = await answerService.getAnswerById(params.id as string);
      setAnswer(answerData);
      
      // Load the question this answer belongs to
      if (answerData.questionId) {
        try {
          const questionData = await questionService.getQuestionById(answerData.questionId);
          setQuestion(questionData);
        } catch (error) {
          console.error('Failed to load question:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load answer:', error);
      toast.error('Failed to load answer');
      router.push('/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!answer) return;
    try {
      await answerService.voteAnswer(answer.id, voteType);
      loadAnswer(); // Reload to get updated vote counts
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to vote');
    }
  };

  const handleAcceptAnswer = async () => {
    if (!answer || !question) return;
    try {
      await answerService.acceptAnswer(answer.id, question.id);
      toast.success('Answer accepted!');
      loadAnswer();
      if (question) {
        const updatedQuestion = await questionService.getQuestionById(question.id);
        setQuestion(updatedQuestion);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to accept answer');
    }
  };

  const getFullImageUrl = (relativePath: string) => {
    if (!relativePath) return '';
    // If already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:9001';
    // Ensure the path starts with a slash if it's a relative path
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  if (!isAuthenticated || loading) return null;
  if (!answer) return null;

  // Role-based answer acceptance permissions
  const isQuestionOwner = question && user?.id === question.userId;
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const canAcceptAnswer = isQuestionOwner || isTeacher || isAdmin;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href={question ? `/questions/${question.id}` : '/questions'}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <FiArrowLeft className="mr-2" />
            {question ? 'Back to Question' : 'Back to Questions'}
          </Link>
        </div>

        {/* Question Preview */}
        {question && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <Link 
              href={`/questions/${question.id}`}
              className="block hover:text-green-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiMessageCircle className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">{question.title}</h2>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{question.description}</p>
            </Link>
          </div>
        )}

        {/* Answer Card */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${
          answer.isAccepted
            ? 'border-green-500 bg-green-50/30'
            : answer.isPinned
            ? 'border-blue-500 bg-blue-50/30'
            : 'border-gray-100'
        }`}>
          {/* Answer Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {answer.authorName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{answer.authorName || 'Anonymous'}</h3>
                  {answer.authorRole === 'teacher' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      🟢 Teacher
                    </span>
                  )}
                  {answer.authorRole === 'student' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      🔵 Student
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{answer.createdAt ? formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true }) : 'Recently'}</span>
                  {answer.updatedAt && answer.updatedAt !== answer.createdAt && (
                    <>
                      <span>•</span>
                      <span>Edited {formatDistanceToNow(new Date(answer.updatedAt), { addSuffix: true })}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {answer.isAccepted && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FiCheckCircle className="w-4 h-4" />
                  ⭐ Accepted Answer
                </span>
              )}
              {answer.isPinned && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FiBookmark className="w-4 h-4" />
                  Pinned
                </span>
              )}
            </div>
          </div>

          {/* Answer Content */}
          {(() => {
            // Extract content - check all possible field names
            const rawContent = answer.content ?? 
                               (answer as any).contentText ?? 
                               (answer as any).content_text ?? 
                               '';
            
            // Convert to string and trim - handle all edge cases
            let contentStr = '';
            if (rawContent !== null && rawContent !== undefined) {
              contentStr = String(rawContent).trim();
            }
            
            if (contentStr && contentStr.length > 0) {
              return (
                <div className="mb-6">
                  <div className="prose max-w-none text-gray-900">
                    <ReactMarkdown>{contentStr}</ReactMarkdown>
                  </div>
                </div>
              );
            } else if (answer.files && answer.files.length > 0) {
              return (
                <div className="text-sm text-gray-500 italic mb-6">No text content provided</div>
              );
            } else {
              return (
                <div className="text-sm text-gray-500 italic mb-6">No content available</div>
              );
            }
          })()}

          {/* Answer Files */}
          {answer.files && answer.files.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiFile className="w-5 h-5" />
                Attachments ({answer.files.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {answer.files.map((file) => {
                  // Construct full file URL - handle all path formats
                  let fileUrl = file.fileUrl || '';
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';
                  const backendBaseUrl = apiUrl.replace('/api', '');
                  
                  // Handle relative paths
                  if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
                    // If it starts with /uploads, use it directly (backend provides correct path)
                    if (fileUrl.startsWith('/uploads/')) {
                      fileUrl = `${backendBaseUrl}${fileUrl}`;
                    } else if (fileUrl.startsWith('uploads/')) {
                      fileUrl = `${backendBaseUrl}/${fileUrl}`;
                    } else {
                      // If it's just a filename, determine path based on file type
                      const isImage = file.fileType === 'image' || 
                        file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      const uploadPath = isImage ? '/uploads/images/' : '/uploads/documents/';
                      fileUrl = `${backendBaseUrl}${uploadPath}${fileUrl.replace(/^\/+/, '')}`;
                    }
                  }
                  
                  // Determine if file is an image - check fileType, extension, and URL
                  const isImage = file.fileType === 'image' || 
                    file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                    fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                  
                  return isImage ? (
                    <div 
                      key={file.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(fileUrl)}
                    >
                      <img
                        src={fileUrl}
                        alt={file.fileName || 'Answer attachment'}
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
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
                      className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-green-50 transition-all"
                    >
                      <FiFile className="w-8 h-8 text-purple-500 mb-2" />
                      <div className="text-sm font-medium text-gray-900 truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{file.fileType}</div>
                      {file.fileSize && (
                        <div className="text-xs text-gray-400 mt-1">
                          {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Answer Actions */}
          <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleVote('upvote')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <FiThumbsUp className="w-5 h-5" />
              <span className="font-semibold">{answer.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiThumbsDown className="w-5 h-5" />
              <span className="font-semibold">{answer.downvotes}</span>
            </button>
            {canAcceptAnswer && !answer.isAccepted && question && (
              <button
                onClick={handleAcceptAnswer}
                className="ml-auto px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
              >
                Accept Answer
              </button>
            )}
          </div>
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
    </div>
  );
}

