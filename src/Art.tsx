export function CatArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 220"
      role="img"
      aria-label="暹罗猫 mini 插画"
    >
      <defs>
        <linearGradient id="cat-body" x2=".6" y2="1">
          <stop stopColor="#ede3cc" />
          <stop offset="1" stopColor="#ccbaa0" />
        </linearGradient>
        <linearGradient id="cat-mask" x2=".6" y2="1">
          <stop stopColor="#685147" />
          <stop offset="1" stopColor="#392e2c" />
        </linearGradient>
      </defs>
      <ellipse cx="125" cy="197" rx="79" ry="11" fill="#9b8569" opacity=".12" />
      <path
        d="M153 143C207 140 209 184 178 193"
        stroke="#645047"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M67 185Q62 132 90 104L148 110Q176 150 160 190Q131 209 67 193Z"
        fill="url(#cat-body)"
      />
      <path
        d="M68 71L64 19Q86 27 101 53M142 50Q161 27 177 27L174 83"
        fill="url(#cat-mask)"
      />
      <path d="M76 57L75 35 94 55M151 56L166 42 166 68" fill="#b58882" />
      <path
        d="M61 78Q65 44 119 47Q178 45 181 86Q183 123 125 134Q65 124 61 78"
        fill="url(#cat-body)"
      />
      <path
        d="M71 80Q91 63 111 81L124 90 138 80Q158 67 172 82Q177 117 126 128Q82 124 71 80"
        fill="url(#cat-mask)"
      />
      <path
        d="M81 91Q94 78 108 94Q95 103 81 91M139 94Q151 80 165 90Q153 103 139 94"
        fill="#9fc7d0"
      />
      <ellipse cx="97" cy="92" rx="3" ry="7" fill="#20282c" />
      <ellipse cx="150" cy="92" rx="3" ry="7" fill="#20282c" />
      <path d="M118 106Q125 102 132 106L125 113Z" fill="#b98c87" />
      <path
        d="M125 114Q122 121 115 117M125 114Q129 121 135 117"
        fill="none"
        stroke="#c8b7a7"
        strokeWidth="1.5"
      />
      <path
        d="M89 110L46 104M91 117L45 121M157 110L197 103M157 116L199 121"
        stroke="#a9957d"
        strokeWidth="1.3"
      />
      <path
        d="M89 176L83 197M138 177L143 197"
        stroke="#d4c2a7"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M79 194L95 194M137 194L151 194"
        stroke="#796252"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function SunsetArt() {
  return (
    <svg
      viewBox="0 0 620 430"
      role="img"
      aria-label="两个人一起看日落的原创插画"
    >
      <defs>
        <linearGradient id="sky-a" x2="0" y2="1">
          <stop stopColor="#c4c9bd" />
          <stop offset=".6" stopColor="#e7c7aa" />
          <stop offset="1" stopColor="#efbb94" />
        </linearGradient>
        <linearGradient id="sea-a" x2="0" y2="1">
          <stop stopColor="#9daea5" />
          <stop offset="1" stopColor="#647e76" />
        </linearGradient>
      </defs>
      <rect width="620" height="430" fill="url(#sky-a)" />
      <circle cx="403" cy="175" r="48" fill="#f8e5b7" />
      <path
        d="M0 226Q101 209 193 226T397 224T620 219V430H0"
        fill="url(#sea-a)"
      />
      <path
        d="M0 267Q130 241 269 264T620 257M0 288Q139 267 321 292T620 285M8 323Q133 302 263 322T620 317"
        stroke="#e2d7b7"
        opacity=".55"
        strokeWidth="2"
        fill="none"
      />
      <path d="M620 263Q418 320 260 350T0 383V430H620" fill="#d1b891" />
      <path
        d="M620 269Q403 338 260 360T0 389"
        stroke="#e7d8b9"
        strokeWidth="6"
        fill="none"
      />
      <g fill="#574e46">
        <circle cx="381" cy="304" r="10" />
        <path d="M372 315L365 353 388 355 391 316Z" />
        <path
          d="M370 352L365 384M385 352L391 383"
          stroke="#574e46"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="416" cy="310" r="9" />
        <path d="M408 319L397 361 430 361 424 322Z" />
        <path
          d="M408 359L405 386M420 359L425 386"
          stroke="#574e46"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M388 323L400 339 410 326"
          fill="none"
          stroke="#574e46"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M116 97q8-8 16 0q8-8 16 0M159 79q6-6 12 0q6-6 12 0"
        stroke="#737d73"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  );
}
export function FlowerArt() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="花束插画">
      <path
        d="M92 180L74 55M102 180L111 38M112 180L143 71"
        stroke="#81917a"
        strokeWidth="4"
      />
      <path d="M55 39L74 48 92 32Q100 80 77 85T55 39" fill="#c99183" />
      <path d="M95 20L111 29 128 17Q137 69 112 72T95 20" fill="#e4b8a0" />
      <path d="M125 49L143 59 164 47Q161 94 141 97T125 49" fill="#b77366" />
      <path
        d="M96 141Q43 112 48 87Q76 89 96 141M110 162Q155 117 171 124Q160 153 110 162"
        fill="#9caa8a"
      />
      <path
        d="M62 132L90 190 118 190 153 132 108 148Z"
        fill="#e8d7b9"
        opacity=".9"
      />
      <path d="M83 169L126 166" stroke="#b08569" strokeWidth="3" />
    </svg>
  );
}
