import {
  Clock,
  MessageSquareOff,
  EyeOff,
  UserX,
  Users,
  TrendingDown,
  PhoneCall,
  MessageCircle,
  Inbox,
  CalendarCheck,
  BrainCircuit,
  BarChart3,
  Globe,
  RefreshCcw,
  Timer,
  TrendingUp,
  Briefcase,
  Moon,
} from "lucide-react";

export const PROBLEMS = [
  {
    icon: <Clock className="w-8 h-8" />,
    text: "Missed calls during busy hours",
    desc: "Patients call while you’re occupied. Every missed call is a lost booking.",
  },
  {
    icon: <MessageSquareOff className="w-8 h-8" />,
    text: "Slow WhatsApp replies",
    desc: "Patients expect instant replies. Even a few minutes delay costs real leads.",
  },
  {
    icon: <EyeOff className="w-8 h-8" />,
    text: "No after-hours response system",
    desc: "Night and weekend inquiries go unanswered — and patients move on.",
  },
  {
    icon: <UserX className="w-8 h-8" />,
    text: "Manual follow-ups rarely happen",
    desc: "Most patients need multiple touchpoints, but teams rarely follow through.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    text: "Staff overwhelmed with inquiries",
    desc: "Your team spends more time replying than treating patients.",
  },
  {
    icon: <TrendingDown className="w-8 h-8" />,
    text: "Leads drop off before booking",
    desc: "Without instant engagement, interest fades before conversion.",
  },
];

export const SOLUTIONS = [
  {
    icon: <PhoneCall className="w-6 h-6" />,
    title: "Answers calls instantly",
    description:
      "AI picks up every call, qualifies the patient, and responds in real time.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Replies on WhatsApp instantly",
    description:
      "Human-like replies within seconds keep conversations active and engaged.",
  },
  {
    icon: <Inbox className="w-6 h-6" />,
    title: "Captures every inquiry",
    description: "All leads are tracked, organized, and ready for follow-up.",
  },
  {
    icon: <CalendarCheck className="w-6 h-6" />,
    title: "Books appointments automatically",
    description:
      "Schedules directly into your calendar without back-and-forth.",
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "Qualifies leads intelligently",
    description: "Focus only on high-intent patients who are ready to book.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Tracks performance in real time",
    description: "Clear insights on leads, response times, and conversions.",
  },
];

export const STEPS = [
  {
    title: "Patient reaches out",
    description:
      "Leads contact you through calls, WhatsApp, or your website — whenever they’re ready.",
    message:
      "New inquiry from John — 'Need help with booking an appointment this week.'",
    smallWin: "Be present everywhere your customers are",
  },
  {
    title: "AI responds instantly",
    description:
      "No delays, no missed opportunities. AI replies within seconds, engaging the lead while interest is highest.",
    message:
      "Hi John! Thanks for reaching out 😊 I can help you book an appointment. What day works best for you?",
    smallWin: "Speed is the difference between winning and losing a lead",
  },
  {
    title: "Appointment gets booked",
    description:
      "AI checks your availability and schedules appointments automatically without back-and-forth.",
    message:
      "You're all set for Tuesday at 3 PM. Looking forward to seeing you!",
    smallWin: "Zero friction means more confirmed bookings",
  },
  {
    title: "Follow-ups happen automatically",
    description:
      "Reminders, reschedules, and re-engagement messages are handled for you — so no lead goes cold.",
    message:
      "Reminder: Your appointment is tomorrow at 3 PM. Reply here if you need to reschedule.",
    smallWin: "Consistent follow-ups = higher show-up rates",
  },
];

export const SERVICES = [
  {
    icon: <PhoneCall className="w-6 h-6" />,
    title: "AI Voice Receptionist",
    description:
      "Handles incoming calls, answers common questions, and books appointments — just like a real receptionist, but available 24/7.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "WhatsApp Automation",
    description:
      "Instant replies, guided service selection, and seamless booking — right where most of your patients already are.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "AI Chatbot (Website & Ads)",
    description:
      "Captures leads from your website and campaigns, engages them instantly, and converts them into booked appointments.",
  },
  {
    icon: <RefreshCcw className="w-6 h-6" />,
    title: "Automated Follow-ups",
    description:
      "Reminders, missed appointment recovery, and re-engagement messages — all handled automatically without manual effort.",
  },
];

export const IMPACTS = [
  {
    icon: <Timer className="w-8 h-8 text-accent" />,
    stat: "2–3x",
    label: "Faster Response Time",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
    stat: "20–40%",
    label: "More Patient Inquiries Captured",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-accent" />,
    stat: "↑ Daily",
    label: "Bookings Without Extra Staff",
  },
  {
    icon: <Briefcase className="w-8 h-8 text-accent" />,
    stat: "Up to 70%",
    label: "Reduced Front Desk Workload",
  },
  {
    icon: <Moon className="w-8 h-8 text-accent" />,
    stat: "24/7",
    label: "After-Hours Patients Captured",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "We used to miss 30–40% of calls during peak hours. Now every patient gets an instant response, and our daily bookings have gone up without hiring extra staff.",
    name: "Dr. Priya Sharma",
    designation: "Clinic Owner",
    src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "Before this, our front desk was overwhelmed with calls and WhatsApp messages. Now everything is automated — reminders, follow-ups, even rescheduling. It’s like having an extra team member who never sleeps.",
    name: "Rohit Mehta",
    designation: "Clinic Operations Manager",
    src: "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    quote:
      "I messaged late at night expecting a reply the next day, but got an instant response and booked my appointment in under a minute. Super smooth experience.",
    name: "Ananya Gupta",
    designation: "Patient",
    src: "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=1368&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];
