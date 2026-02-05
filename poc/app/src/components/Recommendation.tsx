"use client";

import { Recommendation as RecommendationType } from "@/data/types";

interface RecommendationProps {
  recommendation: RecommendationType;
}

export default function Recommendation({ recommendation }: RecommendationProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
        <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 mb-2.5 lg:mb-3">
          💡 RECOMMENDATION
        </h3>
        <div className="space-y-2.5 lg:space-y-3">
          {/* On pass */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                ON YOUR PASS
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
              {recommendation.onPass}
            </p>
          </div>

          {/* Best snow */}
          {recommendation.bestSnow && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  BEST SNOW
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                {recommendation.bestSnow}
              </p>
            </div>
          )}

          {/* Best value */}
          {recommendation.bestValue && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  BEST VALUE
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                {recommendation.bestValue}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
