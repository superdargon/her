import React from 'react'

interface IconProps {
  size?: number
  className?: string
  color?: string
}

interface ArtProps {
  size?: number
  className?: string
  alt?: string
}

const artPath = (name: string) => `/assets/art/${name}`
const mascotPath = (name: string) => `/assets/mascot/emotions/${name}.png`
const mascotViewPath = (name: string) => `/assets/mascot/views/${name}.png`
const mascotRoomPath = (name: string) => `/assets/mascot/rooms/${name}.svg`

export const characterAvatarArt = [
  mascotViewPath('front'),
  mascotViewPath('left'),
  mascotViewPath('right'),
  mascotViewPath('back'),
  mascotPath('idle'),
  mascotPath('happy'),
  mascotPath('thinking'),
  mascotPath('love'),
  mascotPath('sleeping'),
  mascotPath('excited'),
]

const IconWrapper: React.FC<IconProps & { children: React.ReactNode; viewBox?: string; fill?: string }> = ({
  size = 20,
  className = '',
  color,
  viewBox = '0 0 24 24',
  fill = 'none',
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={color ? { color } : undefined}
    aria-hidden="true"
  >
    {children}
  </svg>
)

const ArtImage = ({ src, size = 64, className = '', alt = '' }: ArtProps & { src: string }) => (
  <img
    src={src}
    width={size}
    height={size}
    className={className}
    alt={alt}
    draggable={false}
    style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
  />
)

export const BrandLogo = ({ size = 56, className = '', alt = '?' }: ArtProps) => (
  <ArtImage src={mascotPath('idle')} size={size} className={className} alt={alt} />
)

export const CharacterAvatarArt = ({
  index = 0,
  size = 56,
  className = '',
  alt = '',
}: ArtProps & { index?: number }) => (
  <ArtImage src={characterAvatarArt[index % characterAvatarArt.length]} size={size} className={className} alt={alt} />
)

export const PawArt = ({ size = 56, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={artPath('decor-paw.png')} size={size} className={className} alt={alt} />
)

export const HeartArt = ({ size = 56, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={artPath('decor-heart.png')} size={size} className={className} alt={alt} />
)

export const StarArt = ({ size = 56, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={artPath('decor-star.png')} size={size} className={className} alt={alt} />
)

export const SparklesArt = ({ size = 96, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={artPath('decor-sparkles.png')} size={size} className={className} alt={alt} />
)

export const HomeIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M3.5 10.2 12 3l8.5 7.2" />
    <path d="M5.5 9.8v9.7c0 .8.7 1.5 1.5 1.5h10c.8 0 1.5-.7 1.5-1.5V9.8" />
    <path d="M9.2 21v-6.2c0-.6.5-1.1 1.1-1.1h3.4c.6 0 1.1.5 1.1 1.1V21" />
  </IconWrapper>
)

export const CharactersIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M16.5 20.5v-1.2c0-2.1-2-3.8-4.5-3.8s-4.5 1.7-4.5 3.8v1.2" />
    <circle cx="12" cy="8.2" r="3.2" />
    <path d="M20.5 18.8v-.7c0-1.6-1.2-2.9-3-3.4" />
    <path d="M16.7 5.4a2.7 2.7 0 0 1 0 5.2" />
  </IconWrapper>
)

export const ChatIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M5 5.7h14a2 2 0 0 1 2 2v7.1a2 2 0 0 1-2 2H10l-4.6 3.4v-3.4H5a2 2 0 0 1-2-2V7.7a2 2 0 0 1 2-2Z" />
    <path d="M8 10.6h8" />
    <path d="M8 13.5h5.5" />
  </IconWrapper>
)

export const DiscoverIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="m14.9 8.8-1.7 4.4-4.1 2 1.7-4.4 4.1-2Z" />
  </IconWrapper>
)

export const UserIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M18.5 20.5v-1.8c0-2.4-2.9-4.2-6.5-4.2s-6.5 1.8-6.5 4.2v1.8" />
    <circle cx="12" cy="8" r="3.5" />
  </IconWrapper>
)

export const SettingsIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="m4.2 7.5 1.7 1" />
    <path d="m18.1 15.5 1.7 1" />
    <path d="m4.2 16.5 1.7-1" />
    <path d="m18.1 8.5 1.7-1" />
    <circle cx="12" cy="12" r="4" />
  </IconWrapper>
)

export const DiamondIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M6.5 3.5h11L21 9l-9 11.5L3 9l3.5-5.5Z" />
    <path d="M3 9h18" />
    <path d="m8.5 9 3.5 11.5L15.5 9" />
  </IconWrapper>
)

export const WrenchIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M14.7 5.3a4.8 4.8 0 0 0 4.9 6.4l-7.9 7.9a2.5 2.5 0 1 1-3.5-3.5l7.9-7.9a4.8 4.8 0 0 0-1.4-2.9Z" />
  </IconWrapper>
)

export const BellIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M18 9.8c0-3.2-2.1-5.4-6-5.4s-6 2.2-6 5.4c0 4-1.6 5.7-2.6 6.6h17.2C19.6 15.5 18 13.8 18 9.8Z" />
    <path d="M9.8 19.2a2.3 2.3 0 0 0 4.4 0" />
  </IconWrapper>
)

export const PlusIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </IconWrapper>
)

export const SearchIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m16 16 4 4" />
  </IconWrapper>
)

export const EditIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M5 19h14" />
    <path d="M7.4 15.8 6.8 18l2.3-.5 9.2-9.2a2 2 0 0 0-2.8-2.8l-8.1 10.3Z" />
    <path d="m14.8 6.4 2.8 2.8" />
  </IconWrapper>
)

export const TrashIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M4.5 6.5h15" />
    <path d="M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7" />
    <path d="M7 9v9.2c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5V9" />
    <path d="M10 11v5.5" />
    <path d="M14 11v5.5" />
  </IconWrapper>
)

export const LinkIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M9.8 13.8a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.1 1.1" />
    <path d="M14.2 10.2a4 4 0 0 0-5.7 0L5.7 13a4 4 0 1 0 5.7 5.7l1.1-1.1" />
  </IconWrapper>
)

export const MessageIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M5 5h14a2 2 0 0 1 2 2v7.4a2 2 0 0 1-2 2h-7.8l-5.4 3.7v-3.7H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    <path d="M8 9.5h8" />
    <path d="M8 12.7h5.2" />
  </IconWrapper>
)

export const CheckIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="m5 12.5 4.2 4.2L19.5 6.5" />
  </IconWrapper>
)

export const ChevronRightIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="m9 5.5 6 6.5-6 6.5" />
  </IconWrapper>
)

export const LogoutIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M9 20H5.8A1.8 1.8 0 0 1 4 18.2V5.8C4 4.8 4.8 4 5.8 4H9" />
    <path d="M15 16.5 19.5 12 15 7.5" />
    <path d="M19.5 12H9" />
  </IconWrapper>
)

export const PawIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color} fill="currentColor">
    <ellipse cx="8" cy="7" rx="2" ry="2.8" stroke="none" />
    <ellipse cx="16" cy="7" rx="2" ry="2.8" stroke="none" />
    <ellipse cx="5.6" cy="13" rx="1.8" ry="2.4" stroke="none" />
    <ellipse cx="18.4" cy="13" rx="1.8" ry="2.4" stroke="none" />
    <path d="M8.3 15.8c.5-2.5 2-4 3.7-4s3.2 1.5 3.7 4c.5 2.4-.9 4.2-3.7 4.2s-4.2-1.8-3.7-4.2Z" stroke="none" />
  </IconWrapper>
)

export const StatusOnlineIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="#16CBAA" opacity="0.18" />
    <circle cx="12" cy="12" r="5" fill="#16CBAA" />
  </svg>
)

export const StatusOfflineIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5Z" fill="#94A3B8" opacity="0.18" />
    <path d="M12 7.5 16.5 12 12 16.5 7.5 12 12 7.5Z" fill="#94A3B8" />
  </svg>
)

export const StatusWarningIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="m12 3.5 9 15.5H3L12 3.5Z" fill="#FFB84D" opacity="0.18" />
    <path d="m12 7 5.6 9.7H6.4L12 7Z" fill="#FFB84D" />
  </svg>
)

export const StarDecoration = ({ size = 16, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color} fill="currentColor">
    <path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8Z" stroke="none" />
  </IconWrapper>
)

export const SparkleDecoration = ({ size = 12, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color} fill="currentColor">
    <path d="m12 2 2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3L12 2Z" stroke="none" />
  </IconWrapper>
)

export const HeartDecoration = ({ size = 16, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color} fill="currentColor">
    <path d="M20.3 5.4a5 5 0 0 0-7.1 0L12 6.6l-1.2-1.2a5 5 0 1 0-7.1 7.1l1.2 1.2L12 20.8l7.1-7.1 1.2-1.2a5 5 0 0 0 0-7.1Z" stroke="none" />
  </IconWrapper>
)

export const CloudDecoration = ({ size = 40, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" className={className} opacity="0.08" aria-hidden="true">
    <ellipse cx="32" cy="38" rx="22" ry="14" />
    <ellipse cx="22" cy="30" rx="14" ry="12" />
    <ellipse cx="42" cy="30" rx="14" ry="12" />
  </svg>
)

export const EmptyCharactersIllustration = ({ size = 132, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotRoomPath('day')} size={size} className={className} alt={alt} />
)

export const EmptyChatIllustration = ({ size = 132, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotRoomPath('night')} size={size} className={className} alt={alt} />
)

export const WelcomeIllustration = ({ size = 160, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotRoomPath('sunny')} size={size} className={className} alt={alt} />
)

export const RobotIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="4" y="10" width="16" height="10" rx="3" />
    <path d="M12 10V6" />
    <circle cx="12" cy="4.5" r="1.5" />
    <path d="M8.5 14.5h.1" />
    <path d="M15.4 14.5h.1" />
    <path d="M9 18h6" />
  </IconWrapper>
)

export const WechatIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M10.5 6.2c-4 0-7.2 2.4-7.2 5.4 0 1.7 1 3.2 2.6 4.2l-.5 2.1 2.4-1.2c.8.2 1.7.4 2.7.4 4 0 7.2-2.4 7.2-5.5s-3.2-5.4-7.2-5.4Z" />
    <path d="M14 10.2c3.4.2 6 2.3 6 5 0 1.4-.8 2.7-2 3.6l.4 1.8-2.1-1c-.7.2-1.5.3-2.3.3-2.1 0-4-.8-5.1-2" />
    <path d="M8.2 10.5h.1" />
    <path d="M12.5 10.5h.1" />
  </IconWrapper>
)

export const ChartIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M4 19.5h16" />
    <path d="M7 16v-4" />
    <path d="M12 16V7" />
    <path d="M17 16v-7" />
  </IconWrapper>
)

export const CpuIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
    <path d="M9 3v4" />
    <path d="M15 3v4" />
    <path d="M9 17v4" />
    <path d="M15 17v4" />
    <path d="M3 9h4" />
    <path d="M3 15h4" />
    <path d="M17 9h4" />
    <path d="M17 15h4" />
  </IconWrapper>
)

export const ShieldIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M12 21s7.5-3.8 7.5-9.5V5.3L12 2.8 4.5 5.3v6.2C4.5 17.2 12 21 12 21Z" />
    <path d="m9.2 12.1 2 2 3.8-4.2" />
  </IconWrapper>
)

export const DatabaseIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
    <path d="M19.5 12c0 1.7-3.4 3-7.5 3s-7.5-1.3-7.5-3" />
    <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
  </IconWrapper>
)

export const WifiIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color}>
    <path d="M5 11a10.3 10.3 0 0 1 14 0" />
    <path d="M8 14a6 6 0 0 1 8 0" />
    <path d="M10.8 17a2.1 2.1 0 0 1 2.4 0" />
    <path d="M12 20h.01" />
  </IconWrapper>
)

export const MoreIcon = ({ size = 20, className = '', color }: IconProps) => (
  <IconWrapper size={size} className={className} color={color} fill="currentColor">
    <circle cx="12" cy="5" r="1.8" stroke="none" />
    <circle cx="12" cy="12" r="1.8" stroke="none" />
    <circle cx="12" cy="19" r="1.8" stroke="none" />
  </IconWrapper>
)

export const CatHouseIllustration = ({ size = 120, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotRoomPath('day')} size={size} className={className} alt={alt} />
)

export const CatDecoration = ({ size = 80, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotPath('happy')} size={size} className={className} alt={alt} />
)

export const SleepingCatDecoration = ({ size = 70, className = '', alt = '' }: ArtProps) => (
  <ArtImage src={mascotPath('sleeping')} size={size} className={className} alt={alt} />
)

export const SmallCatIcon = ({ size = 16, className = '', alt = '' }: ArtProps) => (
  <BrandLogo size={size} className={className} alt={alt} />
)
