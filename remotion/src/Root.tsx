import React from "react";
import { Composition } from "remotion";
import { LoomVideo } from "./LoomVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="LoomMCPDemo"
      component={LoomVideo}
      durationInFrames={5400} // 3 min @ 30fps
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  </>
);
