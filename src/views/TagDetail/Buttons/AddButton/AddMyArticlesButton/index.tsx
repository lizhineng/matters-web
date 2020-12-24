import { IconHashTag16, Menu, TextIcon, Translate } from '~/components'

interface AddMyArticlesButtonProps {
  onClick: () => void
}

const AddMyArticlesButton: React.FC<AddMyArticlesButtonProps> = ({
  onClick,
}) => {
  return (
    <Menu.Item onClick={onClick}>
      <TextIcon icon={<IconHashTag16 size="md" />} size="md" spacing="base">
        <Translate id="tagAddArticle" />
      </TextIcon>
    </Menu.Item>
  )
}

export default AddMyArticlesButton
