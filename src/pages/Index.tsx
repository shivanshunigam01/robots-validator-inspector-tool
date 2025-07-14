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
  FileText,
  Shield,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import RobotsEditor from "@/components/RobotsEditor";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Index = () => {
  const [url, setUrl] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [mode, setMode] = useState("live");
  const [checkResources, setCheckResources] = useState(false);
  const [robotsContent, setRobotsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [parsedRules, setParsedRules] = useState([]);
  const [robotsInfo, setRobotsInfo] = useState({ url: "", status: "" });

  const contentRef = useRef(null);

  const userAgentGroups = [
    {
      label: "🔍 Google Bots",
      options: [
        { value: "Googlebot", label: "Google Web Search - Googlebot" },
        { value: "Googlebot-Image", label: "Google Image - Googlebot-Image" },
        { value: "Googlebot-News", label: "Google News - Googlebot-News" },
        { value: "Googlebot-Video", label: "Google Video - Googlebot-Video" },
        { value: "AdsBot-Google", label: "Google Ads Bot - AdsBot-Google" },
        {
          value: "AdsBot-Google-Mobile",
          label: "Google Ads Mobile - AdsBot-Google-Mobile",
        },
        {
          value: "Googlebot-Mobile",
          label: "Google Mobile - Googlebot-Mobile",
        },
        {
          value: "Storebot-Google",
          label: "Google Store Bot - Storebot-Google",
        },
        {
          value: "Googlebot-Favicon",
          label: "Google Favicon - Googlebot-Favicon",
        },
        { value: "SiteVerifier", label: "Google Site Verifier - SiteVerifier" },
        {
          value: "FeedFetcher-Google",
          label: "Google Feedfetcher - FeedFetcher-Google",
        },
        {
          value: "Google-Read-Aloud",
          label: "Google Read Aloud - Google-Read-Aloud",
        },
      ],
    },
    {
      label: "🌐 Bing / Microsoft Bots",
      options: [
        { value: "bingbot", label: "Bing Search - bingbot" },
        { value: "BingPreview", label: "Bing Preview - BingPreview" },
        { value: "adidxbot", label: "Ad indexing - adidxbot" },
        {
          value: "msnbot-health",
          label: "Microsoft Health Bot - msnbot-health",
        },
        { value: "msnbot", label: "MSN Bot (old) - msnbot" },
      ],
    },
    {
      label: "🤖 Miscellaneous",
      options: [{ value: "*", label: "All (robots.txt) - *" }],
    },
  ];

  const handleTest = async () => {
    if (!url.trim() || !userAgent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL and select a User Agent",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    setParsedRules([]);

    try {
      const response = await fetch(
        "https://llms-backend-1.onrender.com/validate-robots",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            user_agent_token: userAgent,
            user_agent_string: "",
            live_test: mode === "live",
            check_resources: checkResources,
            robots_txt: robotsContent,
          }),
        }
      );

      const data = await response.json();

      const parsed = Object.entries(
        data.robotstxt_parsed.content_fixed
      ).flatMap(([agent, rules]) =>
        Array.isArray(rules)
          ? rules.map((rule) => ({
              line: rule.line,
              rule: `User-agent: ${agent}\n${rule.rule}`,
              type: rule.key,
              status:
                rule.key.toLowerCase() === "disallow" ? "blocked" : "allowed",
            }))
          : []
      );

      setParsedRules(parsed);
      setRobotsContent(data.robotstxt.content);

      setRobotsInfo({
        url: data.robotstxt.url,
        status: data.robotstxt.valid ? "200 OK" : "Invalid",
      });

      const tableData = data.url.resources.map((r) => ({
        url: r.url,
        status: `${r.status_code} ${r.status_text}`,
        type: r.type,
        result: `${r.crawl.status} by ${r.crawl.applied_rule.rule}`,
        host: new URL(r.url).hostname,
        allowed: r.crawl.status === "Allowed",
      }));

      setTestResults(tableData);

      toast({
        title: "Success",
        description: "robots.txt validated successfully!",
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (testResults.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(testResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "resource_access_results.xlsx");
  };

  const openInGoogleSheet = () => {
    if (testResults.length === 0) return;

    const csvRows = [
      ["url", "status", "type", "result", "host"],
      ...testResults.map((r) => [r.url, r.status, r.type, r.result, r.host]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // // Trigger download
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "resource_access_results.csv";
    // a.click();

    // Prompt user to open Google Sheets after download
    setTimeout(() => {
      window.open("https://sheets.google.com", "_blank");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FFB100] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Configuration Card */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
          <CardHeader>
             {/* <CardTitle className="text-black flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configuration
            </CardTitle> */}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
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
              <div className="xl:col-span-2 space-y-2">
                <Label className="text-black font-medium">User Agent</Label>
                <Select value={userAgent} onValueChange={setUserAgent}>
                  <SelectTrigger className="bg-white/80 backdrop-blur border-white/50 focus:bg-white/90 transition-all duration-200">
                    <SelectValue placeholder="Select Bot" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 max-h-60">
                    {userAgentGroups.map((group) => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-gray-600 font-medium">
                          {group.label}
                        </SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    <>CHECK</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt Card */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Robots.txt Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RobotsEditor
              content={robotsContent}
              onContentChange={setRobotsContent}
              parsedRules={parsedRules}
              userAgent={userAgent}
              readOnly={mode === "live"}
            />
            <div className="text-sm text-gray-700 mt-4">
              <strong>robots.txt:</strong>{" "}
              <a
                href={robotsInfo.url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                {robotsInfo.url}
              </a>{" "}
              ({robotsInfo.status})
            </div>
          </CardContent>
        </Card>

        {/* Resource Access Results */}
        {testResults.length > 0 && (
          <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Resource Access Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm"
                    onClick={exportToExcel}
                  >
                    Download Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sm"
                    onClick={openInGoogleSheet}
                  >
                    Open in Google Sheet
                  </Button>
                </div>
              </div>
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
                              result.status.startsWith("2")
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
      </div>
    </div>
  );
};

export default Index;
