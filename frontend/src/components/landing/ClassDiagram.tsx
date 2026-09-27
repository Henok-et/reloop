import type { HandlingGroup } from "@/lib/types";
import { CLASS_HANDLING_GROUP, CLASS_LABELS, GIZ_CLASSES, HANDLING_GROUPS } from "@/lib/constants";
import ApplianceIcon from "./ApplianceIcon";

const GROUP_ORDER: HandlingGroup[] = ["refrigerant", "electronics"];

const TAG_STYLE: Record<HandlingGroup, string> = {
  refrigerant: "bg-landing-blue-tag text-landing-blue-tag-text",
  electronics: "bg-landing-green-tag text-landing-green-tag-text",
};

const ICON_STYLE: Record<HandlingGroup, string> = {
  refrigerant: "text-landing-blue",
  electronics: "text-landing-green",
};

/** The seven classes the model knows, grouped by the sorting decision. */
export default function ClassDiagram() {
  return (
    <div className="rounded-xl border border-landing-border bg-landing-panel p-5 sm:p-6">
      <p className="font-plex-mono text-[11px] uppercase tracking-[0.2em] text-landing-faint">
        Seven classes · two handling groups
      </p>

      <div className="mt-5 space-y-5">
        {GROUP_ORDER.map((group) => {
          const classes = GIZ_CLASSES.filter((name) => CLASS_HANDLING_GROUP[name] === group);
          return (
            <div key={group}>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 font-plex-mono text-[10px] font-medium uppercase tracking-[0.16em] ${TAG_STYLE[group]}`}
              >
                {HANDLING_GROUPS[group].short}
              </span>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {classes.map((name) => (
                  <li
                    key={name}
                    className="flex items-center gap-2.5 rounded-lg border border-landing-border bg-landing-panel-2 px-3 py-2.5"
                  >
                    <ApplianceIcon name={name} className={`h-5 w-5 shrink-0 ${ICON_STYLE[group]}`} />
                    <span className="text-sm text-landing-text">{CLASS_LABELS[name]}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <dl className="mt-6 space-y-2 border-t border-landing-border pt-4 text-sm leading-relaxed">
        {GROUP_ORDER.map((group) => (
          <div key={group} className="flex gap-2">
            <dt className={`shrink-0 font-medium ${ICON_STYLE[group]}`}>{HANDLING_GROUPS[group].short}</dt>
            <dd className="text-landing-dim">{HANDLING_GROUPS[group].sortInstruction}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
