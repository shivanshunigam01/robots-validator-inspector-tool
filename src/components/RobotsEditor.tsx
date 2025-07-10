
import React from "react";
import { Card } from "@/components/ui/card";
import { Check, X, AlertCircle, User } from "lucide-react";

interface ParsedRule {
  line: number;
  rule: string;
  type: "user-agent" | "allow" | "disallow" | "sitemap" | "crawl-delay";
  status: "allowed" | "blocked" | "info" | "warning";
}

interface RobotsEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  parsedRules: ParsedRule[];
  userAgent: string;
  readOnly?: boolean;
}

const RobotsEditor: React.FC<RobotsEditorProps> = ({
  content,
  onContentChange,
  parsedRules,
  userAgent,
  readOnly = false
}) => {
  const lines = content.split('\n');

  const getLineStatus = (lineIndex: number) => {
    const rule = parsedRules.find(r => r.line === lineIndex + 1);
    return rule?.status || 'info';
  };

  const getLineIcon = (lineIndex: number) => {
    const status = getLineStatus(lineIndex);
    switch (status) {
      case 'allowed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <X className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLineColor = (lineIndex: number) => {
    const status = getLineStatus(lineIndex);
    switch (status) {
      case 'allowed':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'blocked':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'info':
      default:
        return 'bg-blue-50 border-l-4 border-blue-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor */}
      <Card className="bg-gray-900 text-green-400 font-mono text-sm p-0 overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">robots.txt</span>
            <span className="text-gray-400 text-xs">
              Testing for: <span className="text-green-400">{userAgent}</span>
            </span>
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {readOnly ? (
            <div className="space-y-1">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 py-1 px-2 rounded hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-gray-500 text-xs w-8 text-right">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    {getLineIcon(index)}
                    <span className={`flex-1 ${
                      line.toLowerCase().includes('allow:') ? 'text-green-400' :
                      line.toLowerCase().includes('disallow:') ? 'text-red-400' :
                      line.toLowerCase().includes('user-agent:') ? 'text-blue-400' :
                      line.toLowerCase().includes('sitemap:') ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>
                      {line || ' '}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-64 bg-transparent text-green-400 resize-none outline-none font-mono"
              placeholder="Enter robots.txt content here..."
              spellCheck={false}
            />
          )}
        </div>
      </Card>

      {/* Parsed Rules Display */}
      {parsedRules.length > 0 && (
        <Card className="bg-white">
          <div className="p-4">
            <h3 className="text-black font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Rule Analysis for {userAgent}
            </h3>
            <div className="space-y-2">
              {parsedRules.map((rule, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${getLineColor(rule.line - 1)} transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getLineIcon(rule.line - 1)}
                      <span className="font-mono text-sm text-gray-800">
                        Line {rule.line}: {rule.rule}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.status === 'allowed' ? 'bg-green-100 text-green-800' :
                      rule.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      rule.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RobotsEditor;
