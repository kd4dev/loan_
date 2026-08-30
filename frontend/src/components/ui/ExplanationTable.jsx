import React from 'react';

const ExplanationTable = ({ features = [], type }) => {
  if (!features || features.length === 0) {
    return <p className="text-sm text-muted-foreground">No explanation data available.</p>;
  }

  // Find max absolute value to scale the bars properly
  const maxVal = Math.max(...features.map(f => Math.abs(f.contribution || f.shapValue || 0)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium rounded-tl-lg">Feature</th>
            <th className="px-4 py-3 font-medium">Contribution</th>
            <th className="px-4 py-3 font-medium rounded-tr-lg">Impact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {features.map((feature, idx) => {
            const val = feature.contribution || feature.shapValue || 0;
            const isPositive = val > 0;
            const widthPercent = maxVal === 0 ? 0 : (Math.abs(val) / maxVal) * 100;
            const colorClass = isPositive ? 'bg-success' : 'bg-destructive';
            const textClass = isPositive ? 'text-success' : 'text-destructive';

            return (
              <tr key={idx} className="hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {feature.feature}
                  {feature.description && (
                    <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                      {feature.description}
                    </span>
                  )}
                </td>
                <td className={`px-4 py-3 font-medium ${textClass}`}>
                  {isPositive ? '+' : ''}{val.toFixed(4)}
                </td>
                <td className="px-4 py-3 w-1/3">
                  <div className="flex items-center">
                    {/* Zero line centered visualization approach (simplified) */}
                    <div className="flex-1 flex justify-end pr-2 border-r border-border h-4">
                      {!isPositive && (
                        <div 
                          className={`h-full ${colorClass} rounded-l-sm`} 
                          style={{ width: `${widthPercent}%` }}
                        />
                      )}
                    </div>
                    <div className="flex-1 flex justify-start pl-2 h-4">
                      {isPositive && (
                        <div 
                          className={`h-full ${colorClass} rounded-r-sm`} 
                          style={{ width: `${widthPercent}%` }}
                        />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export { ExplanationTable };
