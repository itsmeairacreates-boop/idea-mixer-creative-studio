import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowLeft, Share2, Calendar, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Idea } from "@shared/schema";

const CARD_COLORS: Record<string, { bg: string; accent: string; text: string; badge: string; badgeText: string; gradient: string }> = {
  coral: {
    bg: "from-[#FF6B6B]/10 to-[#FF6B6B]/5",
    accent: "#FF6B6B",
    text: "text-[#c0392b]",
    badge: "bg-[#FF6B6B]/20",
    badgeText: "text-[#c0392b]",
    gradient: "from-[#FF6B6B] to-[#F59E0B]",
  },
  violet: {
    bg: "from-[#A855F7]/10 to-[#A855F7]/5",
    accent: "#A855F7",
    text: "text-[#7c3aed]",
    badge: "bg-[#A855F7]/20",
    badgeText: "text-[#6d28d9]",
    gradient: "from-[#A855F7] to-[#6366F1]",
  },
  amber: {
    bg: "from-[#F59E0B]/10 to-[#F59E0B]/5",
    accent: "#F59E0B",
    text: "text-[#b45309]",
    badge: "bg-[#F59E0B]/20",
    badgeText: "text-[#92400e]",
    gradient: "from-[#F59E0B] to-[#FF6B6B]",
  },
  emerald: {
    bg: "from-[#10B981]/10 to-[#10B981]/5",
    accent: "#10B981",
    text: "text-[#059669]",
    badge: "bg-[#10B981]/20",
    badgeText: "text-[#065f46]",
    gradient: "from-[#10B981] to-[#0EA5E9]",
  },
  sky: {
    bg: "from-[#0EA5E9]/10 to-[#0EA5E9]/5",
    accent: "#0EA5E9",
    text: "text-[#0284c7]",
    badge: "bg-[#0EA5E9]/20",
    badgeText: "text-[#075985]",
    gradient: "from-[#0EA5E9] to-[#A855F7]",
  },
  rose: {
    bg: "from-[#F43F5E]/10 to-[#F43F5E]/5",
    accent: "#F43F5E",
    text: "text-[#e11d48]",
    badge: "bg-[#F43F5E]/20",
    badgeText: "text-[#9f1239]",
    gradient: "from-[#F43F5E] to-[#A855F7]",
  },
  indigo: {
    bg: "from-[#6366F1]/10 to-[#6366F1]/5",
    accent: "#6366F1",
    text: "text-[#4f46e5]",
    badge: "bg-[#6366F1]/20",
    badgeText: "text-[#3730a3]",
    gradient: "from-[#6366F1] to-[#0EA5E9]",
  },
  lime: {
    bg: "from-[#84CC16]/10 to-[#84CC16]/5",
    accent: "#84CC16",
    text: "text-[#65a30d]",
    badge: "bg-[#84CC16]/20",
    badgeText: "text-[#3f6212]",
    gradient: "from-[#84CC16] to-[#10B981]",
  },
};

export default function IdeaShare() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: idea, isLoading, isError } = useQuery<Idea>({
    queryKey: ["/api/ideas", id],
    queryFn: async () => {
      const res = await fetch(`/api/ideas/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this idea with anyone." });
  };

  const colorStyle = idea ? (CARD_COLORS[idea.color] || CARD_COLORS.violet) : CARD_COLORS.violet;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fff8f0 40%, #f0f9ff 100%)" }}>
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (isError || !idea) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fff8f0 40%, #f0f9ff 100%)" }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Idea not found</h1>
          <p className="text-muted-foreground mb-8">This idea may have been deleted or the link is incorrect.</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-2xl text-white font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #A855F7, #6366F1)" }}>
              ← Back to Studio
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fff8f0 40%, #f0f9ff 100%)" }}>
      {/* Header */}
      <header className="px-6 py-5 max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/">
          <button data-testid="link-back" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6B6B, #A855F7)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Creativity Studio</span>
        </div>
      </header>

      {/* Idea card */}
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <div
          data-testid="shared-idea-card"
          className={`rounded-3xl p-10 shadow-xl border border-white/60 bg-gradient-to-br ${colorStyle.bg}`}
          style={{ backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.65)" }}
        >
          {/* Accent bar */}
          <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${colorStyle.gradient} mb-8`} />

          <div className="flex flex-wrap gap-3 mb-6">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${colorStyle.badge} ${colorStyle.badgeText}`}>
              <Tag className="w-3.5 h-3.5" />
              {idea.category}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground bg-muted">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(idea.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          <h1
            data-testid="text-idea-title"
            className={`text-3xl sm:text-4xl font-extrabold mb-5 ${colorStyle.text}`}
            style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.2 }}
          >
            {idea.title}
          </h1>
          <p data-testid="text-idea-content" className="text-lg text-foreground/80 leading-relaxed">
            {idea.content}
          </p>

          <div className="mt-10 pt-8 border-t border-border/40 flex flex-col sm:flex-row gap-4">
            <button
              data-testid="button-share"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${colorStyle.accent}, #6366F1)`, boxShadow: `0 8px 25px ${colorStyle.accent}50` }}
            >
              <Share2 className="w-5 h-5" />
              Copy share link
            </button>
            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold border-2 border-border transition-all hover:scale-[1.02] hover:bg-muted/50 text-sm">
                ✨ Get your own ideas
              </button>
            </Link>
          </div>
        </div>

        {/* Branding blurb */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Shared from{" "}
            <Link href="/">
              <span className="font-semibold text-[#A855F7] hover:underline cursor-pointer">Creativity Studio</span>
            </Link>{" "}
            — your creative playground ✨
          </p>
        </div>
      </main>
    </div>
  );
}
