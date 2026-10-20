import { Composition } from "remotion";
import { SchoolPromo, TOTAL_FRAMES } from "./SchoolPromo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SchoolPromo"
    component={SchoolPromo}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1920}
    height={1080}
  />
);
