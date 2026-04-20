import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Where is my data stored?",
    a: "Your apps run in a dedicated, isolated container on our managed infrastructure — not shared with any other user. Data is encrypted at rest. We don't access your data for advertising or profiling, and we never sell it. You can export or delete everything at any time.",
  },
  {
    q: "Do I need any technical knowledge?",
    a: "None. If you can use a smartphone app store, you can use Almerno. We handle servers, updates, backups, SSL certificates, and networking. You just use your apps.",
  },
  {
    q: "How much will it cost?",
    a: "Pricing is still being finalised, but our goal is to be competitive with existing cloud storage subscriptions. Waitlist members will get early-access pricing locked in before public launch.",
  },
  {
    q: "Is this open source?",
    a: "The apps we host (Immich, Nextcloud, Vaultwarden, etc.) are all fully open source — that's non-negotiable. The Almerno platform itself is currently closed source, but we plan to open source components over time. The infrastructure code that handles your containers will be auditable.",
  },
  {
    q: "What happens if I want to leave?",
    a: "You own your data. We provide a full export tool so you can download everything before cancelling. No lock-in, no hostage data. We want you to stay because the product is good, not because leaving is painful.",
  },
];

export default function FAQ() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#2a9d98] uppercase tracking-[0.2em] font-medium mb-4">Questions</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#e8f8f8] tracking-tight">
            We&apos;d ask the same things.
          </h2>
        </div>

        <Accordion multiple={false} className="flex flex-col gap-3">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem
              key={i}
              value={i}
              className="border border-white/5 bg-[#0f2240] rounded-2xl px-6 overflow-hidden data-open:border-[#2a9d98]/30 transition-colors duration-200"
            >
              <AccordionTrigger className="font-display font-medium text-[#e8f8f8] text-left hover:no-underline py-5 text-sm sm:text-base cursor-pointer">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[#5a8a87] leading-relaxed font-light pb-5">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
