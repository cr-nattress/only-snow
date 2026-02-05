"use client";

interface AiAnalysisProps {
  analysis: string;
}

export default function AiAnalysis({ analysis }: AiAnalysisProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
        <h3 className="text-xs lg:text-sm font-extrabold tracking-wide text-gray-600 mb-2 lg:mb-3">
          AI ANALYSIS
        </h3>
        <p className="text-sm lg:text-base font-medium text-gray-800 leading-relaxed">
          {analysis}
        </p>
      </div>
    </div>
  );
}
