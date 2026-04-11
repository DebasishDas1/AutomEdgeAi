import {
  Clock,
  MessageSquareOff,
  EyeOff,
  UserX,
  Users,
  TrendingDown,
  Sparkles,
  Target,
  Zap,
  Repeat,
  CalendarCheck,
  BarChart3,
  Timer,
  ArrowUpCircle,
  XCircle,
  Users2,
  Clock3,
  TrendingUp,
} from "lucide-react";

export const FAQS = [
  {
    question: "What industries does Automedge AI serve?",
    answer:
      "Automedge AI is specifically built for service-based businesses, primarily focusing on HVAC, Roofing, Plumbing, and other trade services that rely on rapid lead response.",
  },
  {
    question: "How quickly can I get started with Automedge AI?",
    answer:
      "Most businesses can get their AI sales engine up and running within 24 to 48 hours. Our team handles the initial setup and model training for you.",
  },
  {
    question: "What happens to leads that aren't ready to book immediately?",
    answer:
      "The AI automatically puts them into a nurturing sequence. It checks in via text or WhatsApp at strategic intervals to answer questions and keep your business top-of-mind.",
  },
  {
    question: "Can I integrate Automedge AI with my existing CRM?",
    answer:
      "Yes, we support native integrations with major CRMs like ServiceTitan, Housecall Pro, and HubSpot, as well as thousands of others through Zapier.",
  },
  {
    question: "What kind of analytics and reporting do I get?",
    answer:
      "You get a real-time dashboard showing exactly how many leads were captured, qualified, and booked, along with detailed conversation transcripts and conversion rate trends.",
  },
];

export const PROBLEMS = [
  {
    icon: <Clock className="w-8 h-8" />,
    text: "Slow follow-ups costing you deals",
    desc: "78% of customers buy from the first business that responds.",
  },
  {
    icon: <MessageSquareOff className="w-8 h-8" />,
    text: "Missed WhatsApp inquiries",
    desc: "Every unseen text is a customer calling your competitor instead.",
  },
  {
    icon: <EyeOff className="w-8 h-8" />,
    text: "Zero pipeline visibility",
    desc: "If you don't know your lead source, you're lighting money on fire.",
  },
  {
    icon: <UserX className="w-8 h-8" />,
    text: "Receptionists miss callbacks",
    desc: "Busy teams forget to call back. AI never takes a lunch break.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    text: "Losing to local competitors",
    desc: "Speed to lead is the only competitive advantage that still works.",
  },
  {
    icon: <TrendingDown className="w-8 h-8" />,
    text: "No structured nurturing",
    desc: "Most leads need 5+ touches. Most businesses only give one.",
  },
];

export const SOLUTIONS = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Lead Capture",
    description: "Instantly grab leads from every channel, 24/7.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "AI Qualification",
    description: "Automated triage to identify high-intent prospects.",
  },
  {
    icon: <Repeat className="w-6 h-6" />,
    title: "AI Nurturing",
    description: "Keep leads warm with intelligent, multi-step conversation.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "AI Follow-up",
    description: "Reach back out to cold leads without lifting a finger.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6" />,
    title: "AI Booking",
    description:
      "Seamlessly integrate with your calendar to book appointments.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "AI Analytics",
    description: "Deep insights into your pipeline and conversion rates.",
  },
];

export const IMPACTS = [
  {
    icon: <Timer className="w-8 h-8 text-accent" />,
    stat: "2–3x",
    label: "Faster Response Time",
  },
  {
    icon: <ArrowUpCircle className="w-8 h-8 text-accent" />,
    stat: "30–50%",
    label: "More Booked Appointments",
  },
  {
    icon: <XCircle className="w-8 h-8 text-accent" />,
    stat: "0",
    label: "Zero Missed Leads",
  },
  {
    icon: <Users2 className="w-8 h-8 text-accent" />,
    stat: "40%",
    label: "Reduced Staff Load",
  },
  {
    icon: <Clock3 className="w-8 h-8 text-accent" />,
    stat: "24/7",
    label: "Availability",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
    stat: "85%",
    label: "Higher Conversion Rate",
  },
];
