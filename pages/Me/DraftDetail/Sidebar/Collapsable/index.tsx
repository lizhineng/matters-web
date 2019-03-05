import _get from 'lodash/get'
import { FC, ReactNode, useState } from 'react'

import { Icon, TextIcon } from '~/components'

import COLLAPSE_BRANCH from '~/static/icons/collapse-branch.svg?sprite'

import styles from './styles.css'

const Collapsable: FC<{ title: ReactNode; defaultCollapsed?: boolean }> = ({
  children,
  title,
  defaultCollapsed = true
}) => {
  const [collapsed, toggleCollapse] = useState(defaultCollapsed)

  return (
    <section className={collapsed ? 'collapsed' : 'expanded'}>
      <div>
        <button
          type="button"
          onClick={() => {
            toggleCollapse(!collapsed)
          }}
        >
          <TextIcon
            icon={
              <Icon
                id={COLLAPSE_BRANCH.id}
                viewBox={COLLAPSE_BRANCH.viewBox}
                style={{
                  width: 14,
                  height: 14,
                  transform: `rotate(${collapsed ? 180 : 0}deg)`
                }}
              />
            }
            size="md"
            weight="medium"
            spacing="xtight"
            textPlacement="left"
          >
            {title}
          </TextIcon>
        </button>
      </div>

      {!collapsed && children}

      <style jsx>{styles}</style>
    </section>
  )
}

export default Collapsable
