import { NavBar } from '../components/NavBar'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/urqlClient'
import { usePostsQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

const Index = () => { 

  const [{ data }] = usePostsQuery({
    pause: isServer()
  })

  return (
    <div>
      <NavBar/>
      {!data ? <div>loading...</div>: data.posts.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true})(Index)
