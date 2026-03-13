import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Lightbulb, Share2, Trash2, BookOpen, Palette, Code2, Music, PenTool, TrendingUp, GraduationCap, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Idea } from "@shared/schema";

const CARD_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string }> = {
  coral: {
    bg: "bg-[#FF6B6B]/10",
    border: "border-[#FF6B6B]/30",
    text: "text-[#c0392b]",
    badge: "bg-[#FF6B6B]/20",
    badgeText: "text-[#c0392b]",
  },
  violet: {
    bg: "bg-[#A855F7]/10",
    border: "border-[#A855F7]/30",
    text: "text-[#7c3aed]",
    badge: "bg-[#A855F7]/20",
    badgeText: "text-[#6d28d9]",
  },
  amber: {
    bg: "bg-[#F59E0B]/10",
    border: "border-[#F59E0B]/30",
    text: "text-[#b45309]",
    badge: "bg-[#F59E0B]/20",
    badgeText: "text-[#92400e]",
  },
  emerald: {
    bg: "bg-[#10B981]/10",
    border: "border-[#10B981]/30",
    text: "text-[#059669]",
    badge: "bg-[#10B981]/20",
    badgeText: "text-[#065f46]",
  },
  sky: {
    bg: "bg-[#0EA5E9]/10",
    border: "border-[#0EA5E9]/30",
    text: "text-[#0284c7]",
    badge: "bg-[#0EA5E9]/20",
    badgeText: "text-[#075985]",
  },
  rose: {
    bg: "bg-[#F43F5E]/10",
    border: "border-[#F43F5E]/30",
    text: "text-[#e11d48]",
    badge: "bg-[#F43F5E]/20",
    badgeText: "text-[#9f1239]",
  },
  indigo: {
    bg: "bg-[#6366F1]/10",
    border: "border-[#6366F1]/30",
    text: "text-[#4f46e5]",
    badge: "bg-[#6366F1]/20",
    badgeText: "text-[#3730a3]",
  },
  lime: {
    bg: "bg-[#84CC16]/10",
    border: "border-[#84CC16]/30",
    text: "text-[#65a30d]",
    badge: "bg-[#84CC16]/20",
    badgeText: "text-[#3f6212]",
  },
};

const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  writing: { icon: <PenTool className="w-3.5 h-3.5" />, label: "Writing" },
  design: { icon: <Palette className="w-3.5 h-3.5" />, label: "Design" },
  code: { icon: <Code2 className="w-3.5 h-3.5" />, label: "Code" },
  art: { icon: <Palette className="w-3.5 h-3.5" />, label: "Art" },
  music: { icon: <Music className="w-3.5 h-3.5" />, label: "Music" },
  business: { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Business" },
  learning: { icon: <GraduationCap className="w-3.5 h-3.5" />, label: "Learning" },
  wild: { icon: <Zap className="w-3.5 h-3.5" />, label: "Wild" },
  general: { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Idea" },
};

const PROMPT_CATEGORIES = [
  { value: "surprise", label: "✨ Surprise me", icon: "✨" },
  { value: "writing", label: "✍️ Writing", icon: "✍️" },
  { value: "design", label: "🎨 Design", icon: "🎨" },
  { value: "code", label: "💻 Code", icon: "💻" },
  { value: "art", label: "🖼️ Art", icon: "🖼️" },
  { value: "music", label: "🎵 Music", icon: "🎵" },
  { value: "business", label: "🚀 Business", icon: "🚀" },
  { value: "learning", label: "📚 Learning", icon: "📚" },
  { value: "wild", label: "🌈 Wild card", icon: "🌈" },
];

interface GeneratedPrompt {
  title: string;
  content: string;
  category: string;
  color: string;
}

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("surprise");
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: ideas = [], isLoading: ideasLoading } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  const saveMutation = useMutation({
    mutationFn: (idea: { title: string; content: string; color: string; category: string }) =>
      apiRequest("POST", "/api/ideas", idea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({ title: "Idea saved!", description: "Added to your idea board." });
    },
    onError: () => {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/ideas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({ title: "Idea removed" });
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPrompt(null);
    try {
      const res = await apiRequest("POST", "/api/generate-prompt", { category: selectedCategory });
      const data = await res.json();
      setGeneratedPrompt(data);
    } catch {
      toast({ title: "Could not generate", description: "Something went wrong. Try again!", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedPrompt) return;
    saveMutation.mutate(generatedPrompt);
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/idea/${id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share your idea with anyone." });
  };

  const colors = CARD_COLORS;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fff8f0 40%, #f0f9ff 100%)" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6B6B, #A855F7)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            Creativity Studio
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{ideas.length} {ideas.length === 1 ? "idea" : "ideas"} saved</span>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center px-6 pt-10 pb-14 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
          style={{ background: "rgba(168,85,247,0.1)", color: "#7c3aed" }}>
          <Sparkles className="w-3.5 h-3.5" />
          Your creative playground
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}>
          Too many ideas?{" "}
          <span style={{ background: "linear-gradient(90deg, #FF6B6B, #A855F7, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Perfect.
          </span>
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Generate sparks of inspiration, capture your wildest ideas, and share them with the world. For writers, designers, builders, and everyone in between.
        </p>
      </section>

      {/* AI Prompt Generator */}
      <section className="px-6 max-w-2xl mx-auto mb-20">
        <div className="rounded-3xl p-8 shadow-lg border border-white/60"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF6B6B, #F59E0B)" }}>
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                Idea Generator
              </h2>
              <p className="text-sm text-muted-foreground">Pick a vibe, get inspired</p>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {PROMPT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                data-testid={`category-${cat.value}`}
                onClick={() => setSelectedCategory(cat.value)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
                style={
                  selectedCategory === cat.value
                    ? { background: "linear-gradient(135deg, #A855F7, #6366F1)", color: "white", borderColor: "transparent", transform: "scale(1.05)" }
                    : { background: "white", color: "#374151", borderColor: "#e5e7eb" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Generate button */}
          <button
            data-testid="button-generate"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: isGenerating ? "#9ca3af" : "linear-gradient(135deg, #FF6B6B, #A855F7, #0EA5E9)", boxShadow: isGenerating ? "none" : "0 8px 30px rgba(168,85,247,0.35)" }}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your spark...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate a Creative Prompt
              </span>
            )}
          </button>

          {/* Generated result */}
          {generatedPrompt && (
            <div
              data-testid="generated-prompt"
              className="mt-6 rounded-2xl p-6 border-2 transition-all duration-300"
              style={{
                background: colors[generatedPrompt.color]?.bg.replace("/10", "/20") || "rgba(168,85,247,0.1)",
                borderColor: colors[generatedPrompt.color]?.border.replace("/30", "/50").replace("border-", "").replace("[", "").replace("]", "") || "#a855f7",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${colors[generatedPrompt.color]?.badge} ${colors[generatedPrompt.color]?.badgeText}`}>
                    {CATEGORY_ICONS[generatedPrompt.category]?.icon}
                    {CATEGORY_ICONS[generatedPrompt.category]?.label || generatedPrompt.category}
                  </div>
                  <h3 className={`text-xl font-bold ${colors[generatedPrompt.color]?.text}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                    {generatedPrompt.title}
                  </h3>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-5">{generatedPrompt.content}</p>
              <div className="flex gap-3">
                <button
                  data-testid="button-save-idea"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #10B981, #0EA5E9)" }}
                >
                  {saveMutation.isPending ? "Saving..." : "💾 Save to board"}
                </button>
                <button
                  data-testid="button-regenerate"
                  onClick={handleGenerate}
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ borderColor: "#e5e7eb", color: "#374151", background: "white" }}
                >
                  🔄 Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Idea Board */}
      <section className="px-6 max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Your Idea Board
            </h2>
            <p className="text-muted-foreground mt-1">All your creative sparks in one place</p>
          </div>
        </div>

        {ideasLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl h-56 animate-pulse" style={{ background: "rgba(0,0,0,0.06)" }} />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Your board is empty</h3>
            <p className="text-muted-foreground">Generate a prompt above and save your first idea!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ideas.map((idea) => {
              const colorStyle = colors[idea.color] || colors.violet;
              const catInfo = CATEGORY_ICONS[idea.category] || CATEGORY_ICONS.general;
              return (
                <div
                  key={idea.id}
                  data-testid={`card-idea-${idea.id}`}
                  className={`rounded-3xl p-6 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group ${colorStyle.bg} ${colorStyle.border}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorStyle.badge} ${colorStyle.badgeText}`}>
                      {catInfo.icon}
                      {catInfo.label}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        data-testid={`button-share-${idea.id}`}
                        onClick={() => handleShare(idea.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/60"
                        title="Copy share link"
                      >
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        data-testid={`button-delete-${idea.id}`}
                        onClick={() => deleteMutation.mutate(idea.id)}
                        disabled={deleteMutation.isPending}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-red-100"
                        title="Delete idea"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${colorStyle.text}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                    {idea.title}
                  </h3>
                  <p className="text-sm text-foreground/75 leading-relaxed line-clamp-3">{idea.content}</p>
                  <div className="mt-4 pt-4 border-t border-current/10 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(idea.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <Link
                      href={`/idea/${idea.id}`}
                      data-testid={`link-idea-${idea.id}`}
                      className="text-xs font-medium underline underline-offset-2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      View & share →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-muted-foreground border-t border-border/40">
        <p>Made for the curious, the makers, and the delightfully restless. ✨</p>
      </footer>
    </div>
  );
}
