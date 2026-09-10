export type Pose = {
  camera: [number, number, number];
  target: [number, number, number];
  spin: number;
  tilt: number;
  explode: number;
  callouts: number;
  zoom: number;
};

const poses: Pose[] = [
  // 0 - hero: three-quarter product shot, floating between the two blocks of copy
  { camera: [0.6, 8.6, 17.6], target: [0, 0.6, 0], spin: -0.42, tilt: 0.05, explode: 0, callouts: 0, zoom: 0.84 },
  // 1 - the trade: swings side-on and slides left of the copy
  { camera: [5.6, 4.6, 16.4], target: [2.7, 0.5, 0], spin: 0.9, tilt: 0.11, explode: 0.14, callouts: 0, zoom: 0.8 },
  // 2 - hardware: exploded, centred, leaders out
  { camera: [-1.7, 5.4, 20.5], target: [-0.9, 1.9, 0], spin: 2.5, tilt: 0.04, explode: 1, callouts: 1, zoom: 0.58 },
  // 3 - rules: flat plan view, parked right of the checklist
  { camera: [-2.6, 21, 1], target: [-2.6, 0, 0], spin: 3.15, tilt: 0, explode: 0.2, callouts: 0, zoom: 0.52 },
  // 4 - timeline: low raking angle, board edge-lit on the left
  { camera: [6.2, 2.6, 22], target: [4.4, 1.1, 0], spin: 3.86, tilt: -0.09, explode: 0.08, callouts: 0, zoom: 0.72 },
  // 5 - questions: sunk to the floor of the frame, quiet
  { camera: [-2.2, 9.5, 22], target: [-3, 3.2, 0], spin: 4.7, tilt: 0.05, explode: 0, callouts: 0, zoom: 0.55 },
  // 6 - rsvp: assembled, dead-on, sitting under the sign-up like a plinth
  { camera: [0, 9, 18], target: [0, 4.2, 0], spin: 6.28, tilt: 0.03, explode: 0, callouts: 0, zoom: 0.78 },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Each pose lands when its section sits centred in the viewport. */
export function poseAt(progress: number): Pose {
  const stage = progress - 0.5;
  const i = Math.min(poses.length - 1, Math.max(0, Math.floor(stage)));
  const j = Math.min(poses.length - 1, i + 1);
  const t = smooth(Math.min(1, Math.max(0, stage - i)));
  const a = poses[i];
  const b = poses[j];
  const mix = (x: number, y: number) => x + (y - x) * t;

  return {
    camera: [
      mix(a.camera[0], b.camera[0]),
      mix(a.camera[1], b.camera[1]),
      mix(a.camera[2], b.camera[2]),
    ],
    target: [
      mix(a.target[0], b.target[0]),
      mix(a.target[1], b.target[1]),
      mix(a.target[2], b.target[2]),
    ],
    spin: mix(a.spin, b.spin),
    tilt: mix(a.tilt, b.tilt),
    explode: mix(a.explode, b.explode),
    callouts: mix(a.callouts, b.callouts),
    zoom: mix(a.zoom, b.zoom),
  };
}
