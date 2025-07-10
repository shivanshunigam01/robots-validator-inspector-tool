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
  TableRow,
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
  Shield,
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
        "Google-InspectionTool",
      ],
    },
    {
      label: "Bing Bots",
      options: ["Bingbot", "BingPreview", "msnbot"],
    },
    {
      label: "SEO Tools",
      options: ["AhrefsBot", "SemrushBot", "MJ12bot", "ScreamingFrogSEOSpider"],
    },
    {
      label: "Social Media Bots",
      options: ["Twitterbot", "facebookexternalhit", "LinkedInBot", "WhatsApp"],
    },
    {
      label: "Other Bots",
      options: ["DuckDuckBot", "Baiduspider", "YandexBot", "Slurp"],
    },
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
      allowed: true,
    },
    {
      url: "https://example.com/admin",
      status: "403 Forbidden",
      type: "Document",
      result: "Blocked by Disallow: /admin",
      host: "example.com",
      allowed: false,
    },
    {
      url: "https://example.com/public/page.html",
      status: "200 OK",
      type: "Document",
      result: "Allowed by Allow: /public/",
      host: "example.com",
      allowed: true,
    },
    {
      url: "https://example.com/styles.css",
      status: "200 OK",
      type: "Stylesheet",
      result: "Allowed by Allow: /",
      host: "example.com",
      allowed: true,
    },
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
      const parsedUrl = new URL(url);
      const robotsUrl = `${parsedUrl.origin}/robots.txt`;

      // Use public CORS proxy to bypass CORS restrictions
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        robotsUrl
      )}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch robots.txt file.");
      }

      const fetchedContent = await response.text();
      setRobotsContent(fetchedContent);

      // Parse robots.txt lines into structured rules
      const lines = fetchedContent.split("\n");
      const rules = lines
        .map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          let type = "info";
          let status = "info";

          if (trimmed.toLowerCase().startsWith("user-agent")) {
            type = "user-agent";
          } else if (trimmed.toLowerCase().startsWith("disallow")) {
            type = "disallow";
            status = "blocked";
          } else if (trimmed.toLowerCase().startsWith("allow")) {
            type = "allow";
            status = "allowed";
          } else if (trimmed.toLowerCase().startsWith("sitemap")) {
            type = "sitemap";
          }

          return {
            line: index + 1,
            rule: trimmed,
            type,
            status,
          };
        })
        .filter(Boolean); // remove empty/null lines

      setParsedRules(rules);

      setTestResults([
        {
          url: robotsUrl,
          status: "200 OK",
          type: "Document",
          result: "robots.txt fetched successfully",
          host: parsedUrl.hostname,
          allowed: true,
        },
      ]);

      toast({
        title: "Success",
        description: "robots.txt fetched and analyzed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Unable to fetch robots.txt — ${error.message}`,
        variant: "destructive",
      });
      setRobotsContent("");
      setParsedRules([]);
      setTestResults([]);
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
      testResults,
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url_download = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
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
${testResults
  .map((result) => `${result.url} - ${result.status} - ${result.result}`)
  .join("\n")}`;

    navigator.clipboard.writeText(output);
    toast({
      title: "Copied",
      description: "Results copied to clipboard!",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFB100] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8"></div>

        {/* Top Section */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
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
                  className="bg-white/80 backdrop-blur border-white/50 placeholder:text-gray-500 focus:bg-white/90 transition-all duration-200"
                />
              </div>

              {/* User Agent Dropdown */}
              <div className="xl:col-span-2 space-y-2">
                <Label className="text-black font-medium">User Agent</Label>
                <Select value={userAgent} onValueChange={setUserAgent}>
                  <SelectTrigger className="bg-white/80 backdrop-blur border-white/50 focus:bg-white/90 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 max-h-60">
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

              {/* Mode */}
              <div className="space-y-2">
                <Label className="text-black font-medium">Mode</Label>
                <RadioGroup value={mode} onValueChange={setMode}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="live" id="live" />
                    <Label htmlFor="live" className="text-black cursor-pointer">
                      Live
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="editor" id="editor" />
                    <Label
                      htmlFor="editor"
                      className="text-black cursor-pointer"
                    >
                      Editor
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Check Resources + Test */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resources"
                    checked={checkResources}
                    onCheckedChange={(checked) =>
                      setCheckResources(checked === true)
                    }
                    className="border-black data-[state=checked]:bg-black"
                  />
                  <Label
                    htmlFor="resources"
                    className="text-black cursor-pointer"
                  >
                    Check Resources
                  </Label>
                </div>

                <Button
                  onClick={handleTest}
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-gray-900 text-white font-semibold shadow-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      TESTING...
                    </>
                  ) : (
                    <>
                      {/* <TestTube className="w-4 h-4 mr-2" /> */}
                      CHECK
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
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
          <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
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
                      <TableHead className="text-black font-semibold">
                        Resource URL
                      </TableHead>
                      <TableHead className="text-black font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-black font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-black font-semibold">
                        Result
                      </TableHead>
                      <TableHead className="text-black font-semibold">
                        Host
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.map((result, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {result.url}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              result.status.includes("200")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
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
                            <span
                              className={`text-sm ${
                                result.allowed
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
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
        <div className="text-center py-6"></div>
      </div>
    </div>
  );
};

export default Index;
