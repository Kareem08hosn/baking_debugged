import { CHANNEL_HANDLE, SOCIAL_LINKS } from "@/lib/site";

// Each strip of tape sits at its own slight angle.
const TILT = ["-rotate-[1.5deg]", "ml-4 rotate-1", "-rotate-[0.5deg]"];

// Links to the video channel, written on strips of masking tape.
export default function ChannelLinks() {
  return (
    <div>
      <h2 className="section-title">
        <span className="highlight">Watch the experiments</span>
      </h2>
      <div className="mt-6 grid max-w-96 gap-4">
        {SOCIAL_LINKS.map((link, index) => (
          <a
            key={link.name}
            href={link.href}
            className={`tape-strip ${TILT[index] ?? ""}`}
          >
            {link.name}
            <span className="text-[0.8125rem] font-normal">{CHANNEL_HANDLE}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
