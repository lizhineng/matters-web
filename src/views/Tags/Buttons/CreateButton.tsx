import { useContext } from 'react'

import {
  Button,
  TagDialog,
  TextIcon,
  Translate,
  ViewerContext,
} from '~/components'

const CreateButton = () => {
  const viewer = useContext(ViewerContext)

  if (!viewer.isAuthed) {
    return null
  }

  return (
    <TagDialog>
      {({ open }) => (
        <Button
          size={['6rem', '2rem']}
          bgActiveColor="grey-lighter"
          onClick={open}
        >
          <TextIcon color="green" size="md" weight="md">
            <Translate id="createTag" />
          </TextIcon>
        </Button>
      )}
    </TagDialog>
  )
}

export default CreateButton
