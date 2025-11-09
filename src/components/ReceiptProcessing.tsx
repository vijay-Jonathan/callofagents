import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { receiptApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ShoppingBag,
  FileText
} from "lucide-react";

interface ReceiptData {
  merchant_name: string;
  amount: number;
  transaction_date: string;
  category: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  tax: number;
  tip: number;
}

interface SpendingInsights {
  category_insight: string;
  trend: string;
  recommendation: string;
  alert: string | null;
  comparison: string;
  spending_summary: Record<string, { count: number; total: number; average: number }>;
}

const ReceiptProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsights | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const { toast } = useToast();

  const customerId = 123; // Demo customer ID

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setReceiptData(null);
      setSpendingInsights(null);
      setIsDuplicate(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const result = await receiptApi.uploadReceipt(customerId, selectedFile);

      if (result.success) {
        setReceiptData(result.receipt_data);
        setSpendingInsights(result.spending_insights);
        setIsDuplicate(result.is_duplicate);

        toast({
          title: result.is_duplicate ? "Duplicate Detected" : "Receipt Processed!",
          description: result.is_duplicate 
            ? "This receipt was already uploaded" 
            : "AI successfully extracted and analyzed your receipt",
        });
      }
    } catch (error) {
      console.error('Failed to process receipt:', error);
      toast({
        title: "Processing Failed",
        description: "Unable to process receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      dining: <span>🍽️</span>,
      groceries: <span>🛒</span>,
      shopping: <span>🛍️</span>,
      travel: <span>✈️</span>,
      utilities: <span>💡</span>,
      entertainment: <span>🎬</span>,
      healthcare: <span>⚕️</span>,
      other: <span>📌</span>
    };
    return icons[category] || icons.other;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === "decreasing") return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <span className="text-yellow-500">➡️</span>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          📸 Receipt Processing
        </h1>
        <p className="text-muted-foreground">
          Multi-Modal AI: Gemini Flash 1.5 (Vision) + Nemotron (Reasoning)
        </p>
      </div>

      {/* Upload Section */}
      <Card className="glass p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <label 
              htmlFor="receipt-upload" 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/60 transition-smooth bg-secondary/20 hover:bg-secondary/40"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Receipt preview" 
                    className="max-h-48 rounded-lg shadow-lg"
                  />
                ) : (
                  <>
                    <Upload className="w-12 h-12 mb-4 text-primary" />
                    <p className="mb-2 text-sm font-semibold">
                      Click to upload receipt
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG (MAX. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input 
                id="receipt-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={isProcessing}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Process Receipt
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {receiptData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Extracted Data */}
          <Card className="glass p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Extracted Data
              </h3>
              {isDuplicate && (
                <Badge variant="destructive">Duplicate</Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Merchant</span>
                <span className="font-semibold">{receiptData.merchant_name}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </span>
                <span className="font-bold text-lg">${receiptData.amount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </span>
                <span className="font-semibold">{receiptData.transaction_date}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Category
                </span>
                <Badge className="flex items-center gap-1">
                  {getCategoryIcon(receiptData.category)}
                  {receiptData.category}
                </Badge>
              </div>

              {receiptData.items && receiptData.items.length > 0 && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-1">
                    {receiptData.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {receiptData.tax > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax</span>
                  <span>${receiptData.tax.toFixed(2)}</span>
                </div>
              )}

              {receiptData.tip > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tip</span>
                  <span>${receiptData.tip.toFixed(2)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* AI Insights */}
          {spendingInsights && (
            <Card className="glass p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>🧠</span>
                AI Spending Insights
              </h3>

              <div className="space-y-4">
                {spendingInsights.alert && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500 mb-1">Budget Alert</p>
                      <p className="text-sm">{spendingInsights.alert}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(spendingInsights.trend)}
                    <span className="font-semibold capitalize">{spendingInsights.trend} Trend</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{spendingInsights.category_insight}</p>
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="font-semibold mb-2">💡 Recommendation</p>
                  <p className="text-sm">{spendingInsights.recommendation}</p>
                </div>

                {spendingInsights.comparison && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="font-semibold mb-2">📊 Month Comparison</p>
                    <p className="text-sm text-muted-foreground">{spendingInsights.comparison}</p>
                  </div>
                )}

                {spendingInsights.spending_summary && Object.keys(spendingInsights.spending_summary).length > 0 && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="font-semibold mb-3">This Month's Spending</p>
                    <div className="space-y-2">
                      {Object.entries(spendingInsights.spending_summary).map(([category, data]) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            {category}
                          </span>
                          <span className="font-semibold">${data.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Info Card */}
      {!receiptData && !isProcessing && (
        <Card className="glass p-6">
          <h3 className="text-lg font-bold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Upload Receipt</p>
                <p className="text-sm text-muted-foreground">Take a photo or upload an image</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold mb-1">AI Extraction</p>
                <p className="text-sm text-muted-foreground">Gemini Flash extracts data from image</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold mb-1">Smart Analysis</p>
                <p className="text-sm text-muted-foreground">Nemotron analyzes spending patterns</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReceiptProcessing;
