import { useEffect, useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { QUALITY } from '../lib/capabilities'

/**
 * The clip on the personnel file.
 *
 * A gem clip is one continuous wire, and that is how it is built here: a
 * single curve run through a tube, rather than a couple of flat U shapes
 * faked with boxes. The shape is the standard one - a long outer U, a shorter
 * inner U nested inside it, and two free ends that finish partway down the
 * length rather than at either tip:
 *
 *        bend end                                far end
 *          .--------------------------------------.
 *         /   .------------------------------.     \     <- inner U
 *        |   |            .------------------'      |
 *         \  `-----------'                         /
 *          `------------------------------------'        <- outer U
 *
 * What makes it read as *clipped onto* the file rather than drawn on it is
 * that the wire changes sides partway along: one leg rides on top of the
 * cover, the other is threaded underneath, and the bend is what joins them.
 * A wire can only cross from one face to the other clear of the paper, so the
 * bend has to hang past an edge - which is why this is positioned to straddle
 * one, and why its height is not constant. See Y_TOP, Y_UNDER and the ramp
 * through the outer bend below.
 */

/* --- Wire path ---------------------------------------------------------
   Laid out in the clip's own frame: +Z runs from the bend end (z = 0) to the
   far end, X across, and Y is measured from the surface it is clipped to. */

/** Across the clip, outer leg to outer leg. */
const WIDTH = 0.072
/** Bend end to far end. */
const LENGTH = 0.235
/** Wire gauge. */
const WIRE_RADIUS = 0.0075

const HALF_W = WIDTH / 2
/** The outer U's bend is a half circle the full width of the clip... */
const BEND_R = HALF_W
/** ...and the inner U's is half that, tucked inside it. */
const INNER_R = HALF_W / 2

/**
 * How far the bend end hangs past the edge being clipped over. The crossing
 * from the upper face to the lower one happens inside this overhang, so it
 * has to clear the bend that carries it.
 */
export const OVERHANG = BEND_R + 0.016

/** The wire riding on top, measured from the surface it lies on. */
const Y_TOP = 0.0105
/**
 * The wire threaded underneath. Far enough down to be buried in the cover
 * slab, which is what hides it: the underside of a clip is not visible on a
 * shut file, and drawing it on top would read as two clips rather than one.
 */
const Y_UNDER = -0.0295
const Y_MID = (Y_TOP + Y_UNDER) / 2

/** The free ends, measured from the bend end. */
const UNDER_END = 0.165
const INNER_END = 0.085

/**
 * A point on one of the two half-circle bends.
 *
 * `turn` runs 0..1 from the middle of the clip round to the outer leg, `cx`
 * and `cz` place the circle's centre, and `dir` is which way along the clip
 * the bend arches - the outer one towards the bend end, the inner one towards
 * the far end.
 */
function bend({ cx, cz, radius, dir, turn, y }) {
  const a = Math.PI * turn
  return new Vector3(cx + Math.cos(a) * radius, y, cz + dir * Math.sin(a) * radius)
}

/**
 * The wire, end to end, plus the stretch of it that is actually lying on the
 * cover.
 *
 * Order matters for the first: this is a single strand, so it runs from one
 * free end to the other and the side swap is a fact of where it has got to
 * along that strand, not a separate piece.
 *
 * The second is everything from the paper's edge onwards, and exists for the
 * contact shadow - which must leave out the buried leg, since that half is
 * under the paper and casts nothing onto the face of it.
 */
function wirePoints() {
  const innerCz = LENGTH - INNER_R
  const outer = { cx: 0, cz: BEND_R, radius: BEND_R, dir: -1 }
  const inner = { cx: -INNER_R, cz: innerCz, radius: INNER_R, dir: 1 }

  /* Up the outer leg on top of the cover, round the inner U at the far end,
     and back down the middle to the second free end. */
  const onCover = [
    new Vector3(-HALF_W, Y_TOP, BEND_R),
    new Vector3(-HALF_W, Y_TOP, LENGTH * 0.5),
    new Vector3(-HALF_W, Y_TOP, innerCz),
    bend({ ...inner, turn: 0.75, y: Y_TOP }),
    bend({ ...inner, turn: 0.5, y: Y_TOP }),
    bend({ ...inner, turn: 0.25, y: Y_TOP }),
    new Vector3(0, Y_TOP, innerCz),
    new Vector3(0, Y_TOP, INNER_END + (innerCz - INNER_END) * 0.45),
    new Vector3(0, Y_TOP, INNER_END),
  ]

  const all = [
    /* Free end of the buried leg, then forward to the bend, all underneath. */
    new Vector3(HALF_W, Y_UNDER, UNDER_END),
    new Vector3(HALF_W, Y_UNDER, UNDER_END * 0.62),
    new Vector3(HALF_W, Y_UNDER, BEND_R),

    /* The bend, out past the edge - the one stretch with paper on neither
       side of it, and so the only place the wire can climb from the lower
       face to the upper one. The rise is spread across the whole half circle
       so it reads as a wrap rather than a kink. */
    bend({ ...outer, turn: 0.25, y: Y_UNDER + (Y_MID - Y_UNDER) * 0.4 }),
    bend({ ...outer, turn: 0.5, y: Y_MID }),
    bend({ ...outer, turn: 0.75, y: Y_TOP - (Y_TOP - Y_MID) * 0.4 }),

    ...onCover,
  ]

  /* The shadow starts where the paper does, not where the top-side wire does:
     the leg reaches the upper face out in the overhang, and a shadow drawn
     there would hang in mid air off the edge of the file. */
  return { all, onCover: [new Vector3(-HALF_W, Y_TOP, OVERHANG), ...onCover.slice(1)] }
}

/* Tube resolution. Nothing about the clip varies per instance and there is
   only ever one file on the desk, so these are settled once at module scope
   rather than per render. */
const TUBULAR = Math.max(64, QUALITY.segments * 5)
const RADIAL = Math.max(5, Math.round(QUALITY.segments / 4))

/**
 * Plated steel.
 *
 * Metalness is held well under a real metal's, because the room has no
 * environment map: for a fully metallic surface the diffuse term is zero, so
 * all it has to show is what the lights reflect directly - and on the low tier
 * the fill and rim lights are off entirely, which left the clip reading as a
 * black wire on a cream cover. Keeping some diffuse in it means it is lit by
 * the ambient and hemisphere terms like everything else in the room, and the
 * roughness is what carries the sheen instead. Same compromise the brass on
 * the cabinets and the lamp are drawn with.
 */
const STEEL = {
  color: '#e3e7ea',
  metalness: 0.5,
  roughness: 0.3,
  /* A floor under the shading, the same trick the pull chain's cord uses: a
     wire this thin catches almost nothing of a room this dim, and on the low
     tier there is no fill light at all to catch. Low enough to be a sheen
     rather than a glow - it lifts the clip off black without ever reading as
     lit from inside. */
  emissive: '#aeb6bc',
  emissiveIntensity: 0.22,
}

function tube(points, radius, flatten) {
  const curve = new CatmullRomCurve3(
    flatten === undefined ? points : points.map((p) => new Vector3(p.x, flatten, p.z)),
    false,
    'centripetal',
    0.5,
  )
  return new TubeGeometry(curve, TUBULAR, radius, RADIAL, false)
}

/**
 * The clip, clipped over one edge of whatever it is mounted on.
 *
 * Mount it as a child of the thing it is attached to - here the folder's
 * front cover, so it rides the flight to the desk and the cover turn for free
 * rather than needing a second copy of either animation kept in step. Place
 * `position` at the clip's bend end: on the surface it lies on, and OVERHANG
 * past the edge it straddles.
 */
export function Paperclip({ position, rotation = [0, 0, 0] }) {
  const { wire, shadow, ends } = useMemo(() => {
    const points = wirePoints()
    return {
      wire: tube(points.all, WIRE_RADIUS),
      /* A tube is open at both ends, which leaves the cut wire hollow where
         it is looked straight into. Rounding both ends off is also what the
         real thing does - a clip is not snipped square. */
      ends: [points.all[0], points.all[points.all.length - 1]],
      /* Contact shadow: the same wire laid flat on the cover and fattened a
         little, so the clip sits on the paper instead of hovering over it. A
         cast shadow will not do it on its own - the wire is thinner than a
         shadow-map texel at this range, so it drops out at every tier. */
      shadow: tube(points.onCover, WIRE_RADIUS * 1.5, 0.0012),
    }
  }, [])

  useEffect(
    () => () => {
      wire.dispose()
      shadow.dispose()
    },
    [shadow, wire],
  )

  return (
    <group position={position} rotation={rotation}>
      {/* Thrown off to the side the desk lamp is not on, so the shadow falls
          away from the light rather than sitting square under the wire, and
          squashed flat rather than left as the round tube it is built from:
          at full height it stands nearly as tall as the wire it belongs to,
          and from a low angle it covers the wire instead of lying under it. */}
      <mesh geometry={shadow} position={[-0.012, 0, 0.014]} scale={[1, 0.06, 1]}>
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.17}
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={wire} castShadow={QUALITY.shadows}>
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {ends.map((p, i) => (
        <mesh key={i} position={p} castShadow={QUALITY.shadows}>
          <sphereGeometry args={[WIRE_RADIUS, RADIAL * 2, RADIAL]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
    </group>
  )
}
