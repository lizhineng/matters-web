import jump from 'jump.js'
import { forwardRef } from 'react'

import { Button, ButtonProps, TextIcon } from '~/components'

import styles from './styles.module.css'

type NavListItemProps = {
  name: React.ReactNode
  icon: React.ReactNode
  activeIcon: React.ReactNode
  active: boolean
  canScrollTop?: boolean
} & ButtonProps

const NavListItemButton = forwardRef(
  (
    {
      name,
      icon,
      activeIcon,
      active,
      onClick,
      canScrollTop,
      ...props
    }: NavListItemProps,
    ref
  ) => {
    return (
      <Button
        bgActiveColor="greyLighter"
        size={['2rem', '2rem']}
        ref={ref}
        {...props}
        onClick={onClick}
      >
        <TextIcon
          icon={active ? activeIcon : icon}
          size="lg"
          weight="semibold"
          spacing="tight"
          color="black"
        />
      </Button>
    )
  }
)

NavListItemButton.displayName = 'NavListItemButton'

const NavListItem = forwardRef((props: NavListItemProps, ref) => {
  const { active, canScrollTop = true, onClick: baseOnClick } = props
  const onClick = (event?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (baseOnClick) {
      baseOnClick()
    }

    if (active && canScrollTop) {
      event?.preventDefault()
      jump(document.body)
    }
  }

  return (
    <li role="menuitem" className={styles.listItem}>
      <NavListItemButton {...props} onClick={onClick} ref={ref} />
    </li>
  )
})

NavListItem.displayName = 'NavListItem'

export default NavListItem
