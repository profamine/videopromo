import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadKufi } from "@remotion/google-fonts/ReemKufi";
import { loadFont as loadTajawal } from "@remotion/google-fonts/Tajawal";

const { fontFamily: kufi } = loadKufi("normal", { weights: ["700"], subsets: ["arabic"] });
const { fontFamily: tajawal } = loadTajawal("normal", {
  weights: ["400", "700", "800"],
  subsets: ["arabic", "latin"],
});

const C = {
  navy: "#0e1d5a",
  navyDeep: "#091446",
  gold: "#f5a81c",
  teal: "#0f8a7a",
  blue: "#1d3fb8",
  red: "#d23f3f",
  paper: "#f2f5fb",
  ink: "#0e1d5a",
  muted: "#5b6788",
};

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

// ---------- shared building blocks ----------

const useEnter = (delay = 0, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

const Rise: React.FC<{ delay?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  dist = 40,
  children,
  style,
}) => {
  const p = useEnter(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)`, ...style }}>{children}</div>
  );
};

const StarPattern: React.FC<{ color: string; opacity: number; drift?: boolean }> = ({ color, opacity, drift }) => {
  const frame = useCurrentFrame();
  const off = drift ? frame * 0.4 : 0;
  const star =
    "M30 6 L36 18 L50 14 L44 27 L56 34 L42 38 L44 52 L32 44 L22 54 L20 40 L6 36 L18 28 L12 15 L26 18 Z";
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="stars" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform={`translate(${off} ${off / 2})`}>
            <path d={star} fill="none" stroke={color} strokeWidth="1.5" transform="translate(10 10)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" />
      </svg>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ dur: number; bg: "navy" | "paper"; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dark = bg === "navy";
  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? C.navy : C.paper,
        direction: "rtl",
        fontFamily: tajawal,
        color: dark ? "white" : C.ink,
        opacity,
      }}
    >
      <StarPattern color={dark ? "#ffffff" : C.blue} opacity={dark ? 0.06 : 0.07} drift />
      {children}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ text: string; dark?: boolean; delay?: number }> = ({ text, dark, delay = 0 }) => {
  const p = useEnter(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: p }}>
      <div style={{ width: 70 * p, height: 4, background: C.gold, borderRadius: 2 }} />
      <span style={{ fontSize: 34, fontWeight: 700, color: dark ? C.gold : C.teal }}>{text}</span>
    </div>
  );
};

const Title: React.FC<{ children: React.ReactNode; size?: number; delay?: number; color?: string }> = ({
  children,
  size = 96,
  delay = 4,
  color,
}) => (
  <Rise delay={delay}>
    <h1 style={{ fontFamily: kufi, fontSize: size, margin: "14px 0 0", lineHeight: 1.25, color }}>{children}</h1>
  </Rise>
);

const countUp = (frame: number, delay: number, to: number, decimals = 0) => {
  const v = interpolate(frame, [delay, delay + 45], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return v.toFixed(decimals);
};

// ---------- scenes ----------

const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const photo = useEnter(6, 20);
  const zoom = interpolate(frame, [0, dur], [1.12, 1]);
  return (
    <Scene dur={dur} bg="navy">
      <div style={{ position: "absolute", left: 150, top: 150, width: 560, height: 780 }}>
        <div
          style={{
            position: "absolute",
            inset: -22,
            border: `3px solid ${C.gold}`,
            borderRadius: "280px 280px 0 0",
            opacity: photo,
            transform: `translate(-${14 * photo}px, -${14 * photo}px)`,
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "280px 280px 0 0",
            overflow: "hidden",
            transform: `scale(${0.9 + 0.1 * photo})`,
            opacity: photo,
            boxShadow: "0 30px 80px rgba(0,0,0,.45)",
          }}
        >
          <Img src={staticFile("photo_hero.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        </div>
        <Rise delay={30} style={{ position: "absolute", left: -30, bottom: 60 }}>
          <div
            style={{
              background: C.gold,
              color: C.navy,
              fontFamily: kufi,
              fontSize: 38,
              padding: "14px 28px",
              borderRadius: 18,
              transform: "rotate(-6deg)",
              boxShadow: "0 12px 30px rgba(0,0,0,.35)",
            }}
          >
            ريادة بامتياز
          </div>
        </Rise>
      </div>

      <div style={{ position: "absolute", right: 150, top: 250, width: 980 }}>
        <Kicker text="مؤسسة ابتدائية عمومية · آيت أورير · إقليم الحوز" dark delay={10} />
        <Rise delay={16} dist={60}>
          <h1 style={{ fontFamily: kufi, fontSize: 190, margin: "20px 0 0", lineHeight: 1.15 }}>
            مدرسة <span style={{ color: C.gold }}>السلام</span>
          </h1>
        </Rise>
        <Rise delay={30}>
          <p style={{ fontSize: 50, fontWeight: 700, margin: "10px 0 40px", color: "#dfe5ff" }}>
            من أجل مدرسة عمومية ذات جودة للجميع
          </p>
        </Rise>
        <div style={{ display: "flex", gap: 20 }}>
          {["منذ 2012", "1320 متعلمة ومتعلم", "مشروع مؤسسة الريادة"].map((t, i) => (
            <Rise key={t} delay={44 + i * 6}>
              <div style={{ border: "2px solid rgba(255,255,255,.35)", borderRadius: 40, padding: "12px 30px", fontSize: 32 }}>{t}</div>
            </Rise>
          ))}
        </div>
      </div>
    </Scene>
  );
};

const Stats: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const items = [
    { v: 1320, d: 0, suf: "", label: "متعلمة ومتعلم", color: C.blue },
    { v: 32, d: 0, suf: "", label: "قسمًا دراسيًا", color: C.teal },
    { v: 36, d: 0, suf: "", label: "إطارًا تربويًا", color: C.red },
    { v: 93, d: 0, suf: "%", label: "نسبة النجاح العامة", color: C.blue },
    { v: 98.75, d: 2, suf: "%", label: "نسبة المواظبة في الدورة الأولى", color: C.teal },
    { v: 576, d: 0, suf: "", label: "مستفيدًا من حصص الدعم الممتد", color: C.red },
  ];
  const equip = ["16 حجرة دراسية", "35 حاسوبًا", "18 جهاز عرض", "اتصال بالإنترنت", "ملعبان لكرة القدم", "ملعب لكرة السلة", "12 مرحاضًا"];
  return (
    <Scene dur={dur} bg="paper">
      <div style={{ position: "absolute", inset: "90px 140px" }}>
        <Kicker text="البطاقة التعريفية" />
        <Title>مدرسة كبيرة بقلب يتّسع للجميع</Title>
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            background: "white",
            borderRadius: 32,
            border: "2px solid #dbe2f1",
            overflow: "hidden",
          }}
        >
          {items.map((it, i) => {
            const delay = 14 + i * 7;
            return (
              <Rise key={it.label} delay={delay} dist={30}>
                <div
                  style={{
                    padding: "34px 46px",
                    borderLeft: i % 3 !== 2 ? "2px solid #e3e8f3" : undefined,
                    borderBottom: i < 3 ? "2px solid #e3e8f3" : undefined,
                  }}
                >
                  <div style={{ fontSize: 120, fontWeight: 800, color: it.color, lineHeight: 1, direction: "ltr", textAlign: "right" }}>
                    {countUp(frame, delay, it.v, it.d)}
                    {it.suf}
                  </div>
                  <div style={{ fontSize: 34, color: C.muted, marginTop: 14 }}>{it.label}</div>
                </div>
              </Rise>
            );
          })}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 34 }}>
          {equip.map((t, i) => (
            <Rise key={t} delay={70 + i * 5} dist={20}>
              <div style={{ background: "white", border: "2px solid #dbe2f1", borderRadius: 40, padding: "12px 28px", fontSize: 30, fontWeight: 700 }}>{t}</div>
            </Rise>
          ))}
        </div>
      </div>
    </Scene>
  );
};

const Bar: React.FC<{ label: string; from: number; to: number; delay: number }> = ({ label, from, to, delay }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [delay, delay + 30], [0, from], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const b = interpolate(frame, [delay + 30, delay + 75], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const shown = frame < delay + 30 ? a : b;
  return (
    <Rise delay={delay - 6} dist={20} style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, fontWeight: 800, marginBottom: 14 }}>
        <span>{label}</span>
        <span style={{ direction: "ltr", color: C.teal }}>
          <span style={{ color: C.red }}>{from}%</span> → {Math.round(shown)}%
        </span>
      </div>
      <div style={{ position: "relative", height: 26, background: "#d5ddef", borderRadius: 13, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, height: 12, width: `${a}%`, background: "#e07a74", borderRadius: 6 }} />
        <div style={{ position: "absolute", right: 0, bottom: 0, height: 12, width: `${frame < delay + 30 ? 0 : b}%`, background: C.teal, borderRadius: 6 }} />
      </div>
    </Rise>
  );
};

const Learning: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const big = interpolate(frame, [40, 110], [38, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const levels = [
    ["الأول", 94],
    ["الثاني", 90],
    ["الثالث", 96],
    ["الرابع", 95],
    ["الخامس", 97],
    ["السادس", 96],
  ] as const;
  return (
    <Scene dur={dur} bg="paper">
      <div style={{ position: "absolute", inset: "80px 140px" }}>
        <Kicker text="النتائج" />
        <Title size={84}>التعلمات الأساس تتقدم أسبوعًا بعد أسبوع</Title>
        <div style={{ display: "flex", gap: 50, marginTop: 40 }}>
          <div style={{ flex: 1.1, background: "white", borderRadius: 32, border: "2px solid #dbe2f1", padding: "40px 50px" }}>
            <div style={{ fontFamily: kufi, fontSize: 44 }}>التحكم في التعلمات الأساس</div>
            <div style={{ fontSize: 110, fontWeight: 800, direction: "ltr", textAlign: "right", margin: "6px 0 26px" }}>
              <span style={{ color: C.teal }}>38%</span> <span style={{ color: C.muted, fontSize: 70 }}>→</span>{" "}
              <span>{Math.round(big)}%</span>
            </div>
            <Bar label="اللغة العربية" from={46} to={61} delay={30} />
            <Bar label="الرياضيات" from={40} to={55} delay={42} />
            <Bar label="اللغة الفرنسية" from={28} to={40} delay={54} />
          </div>
          <div style={{ flex: 0.9, background: "white", borderRadius: 32, border: "2px solid #dbe2f1", padding: "40px 50px" }}>
            <div style={{ fontFamily: kufi, fontSize: 44, marginBottom: 26 }}>نسب النجاح حسب المستوى</div>
            {levels.map(([l, v], i) => {
              const d = 30 + i * 8;
              const w = interpolate(frame, [d, d + 40], [0, v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              return (
                <div key={l} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                    <span>{l} ابتدائي</span>
                    <span style={{ direction: "ltr" }}>{Math.round(w)}%</span>
                  </div>
                  <div style={{ height: 20, background: "#d5ddef", borderRadius: 10 }}>
                    <div style={{ height: "100%", width: `${w}%`, background: v === 97 ? C.gold : C.blue, borderRadius: 10 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Scene>
  );
};

const Support: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const clubs = ["نادي القارئ الصغير", "أولمبياد الرياضيات", "نادي الخطابة", "نادي الإملاء", "الحافظ الصغير", "نادي المسرح"];
  const zoom = interpolate(frame, [0, dur], [1, 1.1]);
  return (
    <Scene dur={dur} bg="navy">
      <div style={{ position: "absolute", right: 140, top: 150, width: 860 }}>
        <Kicker text="الدعم الممتد" dark />
        <Title size={88} color="white">الدعم يمتد إلى المساء</Title>
        <Rise delay={14}>
          <p style={{ fontSize: 40, color: "#dfe5ff", margin: "20px 0 30px", lineHeight: 1.5 }}>
            من 18:30 إلى 20:00 تفتح المؤسسة أقسامها لحصص دعم التعلمات الأساس.
          </p>
        </Rise>
        <Rise delay={22} style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ fontSize: 190, fontWeight: 800, color: C.gold, lineHeight: 1 }}>{countUp(frame, 22, 576)}</div>
          <div style={{ fontSize: 40, lineHeight: 1.4 }}>
            متعلمة ومتعلم استفادوا
            <br />
            من الحصص المسائية
          </div>
        </Rise>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 36 }}>
          {clubs.map((c, i) => (
            <Rise key={c} delay={50 + i * 5} dist={20}>
              <div style={{ background: C.gold, color: C.navy, padding: "12px 26px", borderRadius: 16, fontSize: 32, fontWeight: 800 }}>{c}</div>
            </Rise>
          ))}
        </div>
      </div>
      <Rise delay={6} dist={80} style={{ position: "absolute", left: 120, top: 170, width: 760, height: 740 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
          <Img src={staticFile("photo_class.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
        </div>
      </Rise>
    </Scene>
  );
};

const Gallery: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const photos = [
    { src: "g_costume.jpg", label: "أزياء مغربية تقليدية" },
    { src: "g_football.jpg", label: "فريق كرة القدم" },
    { src: "g_garden.jpg", label: "مبادرة مدرستي بيتي الثاني" },
    { src: "g_stage.jpg", label: "عروض مسرحية" },
  ];
  return (
    <Scene dur={dur} bg="paper">
      <div style={{ position: "absolute", inset: "80px 140px" }}>
        <Kicker text="الأنشطة والنوادي" />
        <Title>مدرسة تتعلم، تلعب، وتحتفل</Title>
        <Rise delay={10}>
          <p style={{ fontSize: 40, color: C.muted, margin: "16px 0 0" }}>
            <b style={{ color: C.teal }}>13 ناديًا</b> تربويًا بتأطير من الفريق التربوي: البيئي، الخطابة، الرياضي والمزيد.
          </p>
        </Rise>
        <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
          {photos.map((p, i) => {
            const d = 16 + i * 8;
            const z = interpolate(frame, [d, dur], [1.15, 1], { extrapolateLeft: "clamp" });
            return (
              <Rise key={p.src} delay={d} dist={60} style={{ flex: 1 }}>
                <div style={{ position: "relative", height: 520, borderRadius: 30, overflow: "hidden", boxShadow: "0 20px 50px rgba(14,29,90,.25)" }}>
                  <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
                  <div
                    style={{
                      position: "absolute",
                      inset: "auto 0 0 0",
                      padding: "60px 24px 22px",
                      background: "linear-gradient(transparent, rgba(9,20,70,.95))",
                      color: "white",
                      fontSize: 30,
                      fontWeight: 800,
                    }}
                  >
                    {p.label}
                  </div>
                </div>
              </Rise>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

type Clip = { from: number; dur: number; label: string; sub: string };

const DemoClip: React.FC<{ clip: Clip; index: number; total: number }> = ({ clip, index, total }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 10, clip.dur - 10, clip.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 150, top: 300, width: 1620, height: 750 }}>
        <OffthreadVideo
          src={staticFile("rec.mp4")}
          trimBefore={s(clip.from)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
      </div>
      <div style={{ position: "absolute", right: 160, top: 70, display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: C.gold, lineHeight: 1, direction: "ltr" }}>
          {index + 1}/{total}
        </div>
        <div>
          <Rise>
            <div style={{ fontFamily: kufi, fontSize: 64, color: "white" }}>{clip.label}</div>
          </Rise>
          <Rise delay={6}>
            <div style={{ fontSize: 34, color: "#dfe5ff", marginTop: 4 }}>{clip.sub}</div>
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CLIPS: Clip[] = [
  { from: 7, dur: s(6.5), label: "اعرف قسم تلميذك", sub: "اكتب النسب والاسم ويظهر القسم مباشرة" },
  { from: 53, dur: s(5.5), label: "التقويم المدرسي الموحد", sub: "الفروض والامتحانات والعطل في تقويم واحد" },
  { from: 64, dur: s(4.5), label: "استعمالات الزمن", sub: "جدول حصص كل قسم من الاثنين إلى السبت" },
  { from: 81.6, dur: s(2.4), label: "لائحة العطل المدرسية", sub: "عدّاد تنازلي للعطلة المقبلة" },
  { from: 84.6, dur: s(4.5), label: "النوادي المدرسية", sub: "13 ناديًا والتسجيل مفتوح عبر الموقع" },
  { from: 129, dur: s(5), label: "معرض الأنشطة", sub: "لقطات من حياة المؤسسة" },
];

const DEMO_DUR = s(1.5) + CLIPS.reduce((a, c) => a + c.dur, 0);

const Demo: React.FC<{ dur: number }> = ({ dur }) => {
  const frameIn = useEnter(0, 18);
  let start = s(1.5);
  return (
    <Scene dur={dur} bg="navy">
      <Rise style={{ position: "absolute", left: 160, top: 100 }}>
        <div style={{ fontSize: 34, color: C.gold, fontWeight: 800 }}>منصة رقمية في خدمة الأسر</div>
      </Rise>
      {/* browser frame */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 250,
          width: 1620,
          height: 800,
          background: "white",
          borderRadius: 24,
          boxShadow: "0 40px 100px rgba(0,0,0,.5)",
          transform: `scale(${0.92 + 0.08 * frameIn})`,
          opacity: frameIn,
          overflow: "hidden",
          direction: "ltr",
        }}
      >
        <div style={{ height: 50, background: "#e6eaf3", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
          <div style={{ marginLeft: 30, background: "white", borderRadius: 10, height: 30, width: 600, fontSize: 18, color: C.muted, display: "flex", alignItems: "center", padding: "0 16px" }}>
            مدرسة السلام · الموقع الرسمي
          </div>
        </div>
      </div>
      {CLIPS.map((c, i) => {
        const from = start;
        start += c.dur;
        return (
          <Sequence key={c.label} from={from} durationInFrames={c.dur}>
            <DemoClip clip={c} index={i} total={CLIPS.length} />
          </Sequence>
        );
      })}
    </Scene>
  );
};

const MapScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], [1, 1.12]);
  return (
    <Scene dur={dur} bg="paper">
      <div style={{ position: "absolute", right: 140, top: 300, width: 700 }}>
        <Kicker text="فضاءات المؤسسة" />
        <Title size={100}>لوحة تشويرية للمؤسسة</Title>
        <Rise delay={12}>
          <p style={{ fontSize: 40, color: C.muted, lineHeight: 1.5, marginTop: 20 }}>
            قاعات التدريس، الجناح الإداري، قاعة الأنشطة والملاعب الرياضية في خريطة واحدة.
          </p>
        </Rise>
      </div>
      <Rise delay={4} dist={60} style={{ position: "absolute", left: 140, top: 70, width: 900, height: 940 }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 30, overflow: "hidden", boxShadow: "0 30px 70px rgba(14,29,90,.3)", background: "white" }}>
          <Img src={staticFile("s11.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%", transform: `scale(${z})` }} />
        </div>
      </Rise>
    </Scene>
  );
};

const Horizons: React.FC<{ dur: number }> = ({ dur }) => {
  const goals = [
    { t: "جودة التعلمات", d: "نسبة نجاح تفوق 96% والتحكم في القراءة والكتابة والحساب لدى الجميع.", c: C.gold },
    { t: "الاحتفاظ بالتلاميذ", d: "بلوغ هدر مدرسي صفري برصد مبكر للتعثر والغياب.", c: C.teal },
    { t: "الحياة المدرسية", d: "استفادة 100% من التلاميذ من الأنشطة النادوية والرياضية والفنية.", c: C.blue },
    { t: "الانفتاح على المحيط", d: "توسيع الشراكات مع الجمعيات والجماعة وأولياء الأمور.", c: C.teal },
    { t: "الرقمنة", d: "الأدوات الرقمية لتتبع التلاميذ وتقويمهم والتواصل مع الأسر.", c: C.gold },
  ];
  return (
    <Scene dur={dur} bg="navy">
      <div style={{ position: "absolute", inset: "120px 140px" }}>
        <Kicker text="الآفاق" dark />
        <Title size={110} color="white">إلى أين تمضي المدرسة؟</Title>
        <div style={{ display: "flex", gap: 30, marginTop: 70 }}>
          {goals.map((g, i) => (
            <Rise key={g.t} delay={18 + i * 10} dist={60} style={{ flex: 1 }}>
              <div style={{ borderTop: `8px solid ${g.c}`, background: "rgba(255,255,255,.06)", borderRadius: "0 0 24px 24px", padding: "34px 28px", height: 440 }}>
                <div style={{ fontFamily: kufi, fontSize: 34, color: g.c === C.blue ? "#8fa8ff" : g.c, marginBottom: 20 }}>{g.t}</div>
                <div style={{ fontSize: 32, lineHeight: 1.6, color: "#e4e9ff" }}>{g.d}</div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Scene>
  );
};

const Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, dur], [0.9, 1.05]);
  return (
    <Scene dur={dur} bg="navy">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ transform: `scale(${glow})` }}>
          <Rise>
            <h1 style={{ fontFamily: kufi, fontSize: 200, margin: 0 }}>
              مدرسة <span style={{ color: C.gold }}>السلام</span>
            </h1>
          </Rise>
          <Rise delay={12}>
            <p style={{ fontSize: 56, fontWeight: 700, margin: "20px 0 50px", color: "#dfe5ff" }}>مدرسة عمومية ذات جودة للجميع</p>
          </Rise>
          <Rise delay={24}>
            <div style={{ display: "inline-block", background: C.gold, color: C.navy, borderRadius: 60, padding: "20px 60px", fontSize: 44, fontWeight: 800 }}>
              زوروا موقع المؤسسة
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- timeline ----------

const TIMELINE: { C: React.FC<{ dur: number }>; dur: number }[] = [
  { C: Intro, dur: s(6) },
  { C: Stats, dur: s(8) },
  { C: Learning, dur: s(7.5) },
  { C: Support, dur: s(7) },
  { C: Gallery, dur: s(6.5) },
  { C: Demo, dur: DEMO_DUR },
  { C: MapScene, dur: s(5) },
  { C: Horizons, dur: s(8) },
  { C: Outro, dur: s(5) },
];

export const TOTAL_FRAMES = TIMELINE.reduce((a, t) => a + t.dur, 0);

// Background music: file name inside public/ (null = no music)
const MUSIC_FILE: string | null = "Design-sans-titre.mp3";
const MUSIC_VOLUME = 0.6;

const musicVolume = (f: number) =>
  interpolate(f, [0, s(1.5), TOTAL_FRAMES - s(3), TOTAL_FRAMES], [0, MUSIC_VOLUME, MUSIC_VOLUME, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SchoolPromo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      {MUSIC_FILE ? <Audio src={staticFile(MUSIC_FILE)} volume={musicVolume} loop /> : null}
      {TIMELINE.map(({ C: Comp, dur }, i) => {
        const start = from;
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <Comp dur={dur} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
