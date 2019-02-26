import { Empty, Icon, Translate } from '~/components'

import ICON_EMPTY_WARNING from '~/static/icons/empty-warning.svg?sprite'

const EmptyArticles = () => (
  <Empty
    icon={
      <Icon
        id={ICON_EMPTY_WARNING.id}
        viewBox={ICON_EMPTY_WARNING.viewBox}
        size={'xxlarge'}
      />
    }
    description={<Translate zh_hant="還沒有創作" zh_hans="还没有创作" />}
  />
)

export default EmptyArticles
