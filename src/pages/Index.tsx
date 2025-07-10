
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Check, 
  X, 
  Download, 
  Copy, 
  TestTube, 
  Globe,
  Bot,
  FileText,
  AlertCircle,
  Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RobotsEditor from "@/components/RobotsEditor";

const Index = () => {
  const [url, setUrl] = useState("https://example.com");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [mode, setMode] = useState("live");
  const [checkResources, setCheckResources] = useState(false);
  const [robotsContent, setRobotsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [parsedRules, setParsedRules] = useState([]);

  const contentRef = useRef<HTMLDivElement>(null);

  const userAgentGroups = [
    {
      label: "Google Search Bots",
      options: [
        "Googlebot",
        "Googlebot-Image",
        "Googlebot-News",
        "Googlebot-Video",
        "Google-InspectionTool"
      ]
    },
    {
      label: "Bing Bots",
      options: [
        "Bingbot",
        "BingPreview",
        "msnbot"
      ]
    },
    {
      label: "SEO Tools",
      options: [
        "AhrefsBot",
        "SemrushBot",
        "MJ12bot",
        "ScreamingFrogSEOSpider"
      ]
    },
    {
      label: "Social Media Bots",
      options: [
        "Twitterbot",
        "facebookexternalhit",
        "LinkedInBot",
        "WhatsApp"
      ]
    },
    {
      label: "Other Bots",
      options: [
        "DuckDuckBot",
        "Baiduspider",
        "YandexBot",
        "Slurp"
      ]
    }
  ];

  const mockRobotsContent = `User-agent: *
Disallow: /admin
Disallow: /private/
Allow: /public/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Disallow: /temp/

Sitemap: https://example.com/sitemap.xml`;

  const mockTestResults = [
    {
      url: "https://example.com/",
      status: "200 OK",
      type: "Document",
      result: "Allowed by Allow: /",
      host: "example.com",
      allowed: true
    },
    {
      url: "https://example.com/admin",
      status: "403 Forbidden",
      type: "Document", 
      result: "Blocked by Disallow: /admin",
      host: "example.com",
      allowed: false
    },
    {
      url: "https://example.com/public/page.html",
      status: "200 OK",
      type: "Document",
      result: "Allowed by Allow: /public/",
      host: "example.com",
      allowed: true
    },
    {
      url: "https://example.com/styles.css",
      status: "200 OK",
      type: "Stylesheet",
      result: "Allowed by Allow: /",
      host: "example.com",
      allowed: true
    }
  ];

  const handleTest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === "live") {
        setRobotsContent(mockRobotsContent);
      }
      
      setParsedRules([
        { line: 1, rule: "User-agent: *", type: "user-agent", status: "info" },
        { line: 2, rule: "Disallow: /admin", type: "disallow", status: "blocked" },
        { line: 3, rule: "Disallow: /private/", type: "disallow", status: "blocked" },
        { line: 4, rule: "Allow: /public/", type: "allow", status: "allowed" },
        { line: 6, rule: "User-agent: Googlebot", type: "user-agent", status: "info" },
        { line: 7, rule: "Allow: /", type: "allow", status: "allowed" },
      ]);
      
      setTestResults(mockTestResults);
      
      toast({
        title: "Success",
        description: "Robots.txt analysis completed!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze robots.txt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const results = {
      url,
      userAgent,
      timestamp: new Date().toISOString(),
      robotsContent,
      parsedRules,
      testResults
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url_download = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_download;
    a.download = `robots-test-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url_download);
    
    toast({
      title: "Downloaded",
      description: "Test results saved successfully!",
    });
  };

  const handleCopy = () => {
    const output = `Robots.txt Test Results
URL: ${url}
User Agent: ${userAgent}
Timestamp: ${new Date().toLocaleString()}

Robots.txt Content:
${robotsContent}

Test Results:
${testResults.map(result => 
  `${result.url} - ${result.status} - ${result.result}`
).join('\n')}`;

    navigator.clipboard.writeText(output);
    toast({
      title: "Copied",
      description: "Results copied to clipboard!",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFF00] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 drop-shadow-lg flex items-center justify-center gap-3">
            <Bot className="w-10 h-10" />
            Robots.txt Validator & Testing Tool
          </h1>
          <p className="text-black/80 text-lg">
            Test and validate your robots.txt file for search engine compliance
          </p>
        </div>

        {/* Top Section: Input Fields */}
        <Card className="bg-white shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
              {/* URL Input */}
              <div className="xl:col-span-2 space-y-2">
                <Label htmlFor="url" className="text-black font-medium">
                  URL
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-white border-gray-300 focus:border-yellow-400 transition-colors"
                />
              </div>

              {/* User Agent Dropdown */}
              <div className="xl:col-span-2 space-y-2">
                <Label className="text-black font-medium">User Agent</Label>
                <Select value={userAgent} onValueChange={setUserAgent}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-yellow-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {userAgentGroups.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-gray-600 font-medium">
                          {group.label}
                        </SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Radio Buttons */}
              <div className="space-y-2">
                <Label className="text-black font-medium">Mode</Label>
                <RadioGroup value={mode} onValueChange={setMode}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="live" id="live" />
                    <Label htmlFor="live" className="text-black cursor-pointer">Live</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="editor" id="editor" />
                    <Label htmlFor="editor" className="text-black cursor-pointer">Editor</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Check Resources + Test Button */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resources"
                    checked={checkResources}
                    onCheckedChange={(checked) => setCheckResources(checked === true)}
                    className="border-black data-[state=checked]:bg-black"
                  />
                  <Label htmlFor="resources" className="text-black cursor-pointer">
                    Check Resources
                  </Label>
                </div>
                
                <Button
                  onClick={handleTest}
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-6"
                >
                  {isLoading ? (
                    <>
                      <TestTube className="w-4 h-4 mr-2 animate-spin" />
                      TESTING...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      TEST
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <Card className="bg-white shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Robots.txt Content
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Result
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Output
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RobotsEditor
              content={mode === "editor" ? robotsContent : mockRobotsContent}
              onContentChange={setRobotsContent}
              parsedRules={parsedRules}
              userAgent={userAgent}
              readOnly={mode === "live"}
            />
          </CardContent>
        </Card>

        {/* Results Table */}
        {testResults.length > 0 && (
          <Card className="bg-white shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Resource Access Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black font-semibold">Resource URL</TableHead>
                      <TableHead className="text-black font-semibold">Status</TableHead>
                      <TableHead className="text-black font-semibold">Type</TableHead>
                      <TableHead className="text-black font-semibold">Result</TableHead>
                      <TableHead className="text-black font-semibold">Host</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.map((result, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {result.url}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.status.includes('200') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {result.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {result.allowed ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm ${
                              result.allowed ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {result.result}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {result.host}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-black/70">
            Developed by <span className="font-semibold text-black">Lovable AI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
