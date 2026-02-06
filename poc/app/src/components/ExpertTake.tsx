"use client";

interface AiAnalysisProps {
  analysis: string;
}

export default function AiAnalysis({ analysis }: AiAnalysisProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-slide-in transition-colors">
      <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
        <h3 className="text-xs lg:text-sm font-extrabold tracking-wide text-gray-600 dark:text-gray-400 mb-2 lg:mb-3">
          AI ANALYSIS
        </h3>
        <p className="text-sm lg:text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
          {analysis}
        </p>
      </div>
    </div>
  );
}
