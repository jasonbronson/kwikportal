<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <p class="title">Kwik Portal</p>
        <p class="subtitle">
          <a href="popup.html#firstinstall" target="_blank">dashboard</a>
        </p>
      </div>
    </section>
    <div v-if="firstInstall">
      <!-- <section>
        <div v-for="item in bookmarks">
          {{ item.title }} {{ convertDate(item.date) }}
        </div>
      </section> -->
      <div class="card-scene">
        <Container
          orientation="horizontal"
          @drop="onColumnDrop($event)"
          drag-handle-selector=".column-drag-handle"
          @drag-start="dragStart"
          :drop-placeholder="upperDropPlaceholderOptions"
        >
          <Draggable v-for="column in childrenTest" :key="column.id">
            <div :class="column.className">
              <div class="card-column-header">
                <span class="column-drag-handle">&#x2630;</span>
                {{ column.name }}
              </div>
              <Container
                group-name="col"
                @drop="e => onCardDrop(column.id, e)"
                @drag-start="e => log('drag start', e)"
                @drag-end="e => log('drag end', e)"
                :get-child-payload="getCardPayload(column.id)"
                drag-class="card-ghost"
                drop-class="card-ghost-drop"
                :drop-placeholder="dropPlaceholderOptions"
              >
                <Draggable v-for="card in column.mychilditems" :key="card.id">
                  <div :class="card.className" :style="card.style">
                    <p>
                      {{ card.data }}
                      <span class="column-drag-handle">&#x2630;</span>
                    </p>
                  </div>
                </Draggable>
              </Container>
            </div>
          </Draggable>
        </Container>
      </div>
    </div>
  </div>
</template>

<script>
import { Container, Draggable } from 'vue-smooth-dnd'

export default {
  data() {
    return {
      msg: 'Text here!',
      childrenTest: [
        {
          className: 'test',
          name: 'Container#',
          id: Math.floor(Math.random() * 999),
          mychilditems: [
            {
              id: Math.floor(Math.random() * 400),
              className: 'ChildClassName',
              data: 'Nothing here',
              style: '',
            },
            {
              id: Math.floor(Math.random() * 400),
              className: 'ChildClassName2',
              data: 'Nothing here2',
              style: '',
            },
          ],
        },
        {
          className: 'test',
          name: 'Container2',
          id: Math.floor(Math.random() * 999),
          mychilditems: [
            {
              id: Math.floor(Math.random() * 400),
              className: 'ChildClassName',
              data: 'Item1',
              style: '',
            },
            {
              id: Math.floor(Math.random() * 400),
              className: 'ChildClassName2',
              data: 'Item2',
              style: '',
            },
          ],
        },
      ],
      firstInstall: false,
      bookmarks: [],
      upperDropPlaceholderOptions: {
        className: 'cards-drop-preview',
        animationDuration: '150',
        showOnTop: true,
      },
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: true,
      },
    }
  },
  components: { Container, Draggable },
  computed: {},
  methods: {
    onColumnDrop(dropResult) {
      // const scene = Object.assign({}, this.scene)
      // scene.children = applyDrag(scene.children, dropResult)
      // this.scene = scene
      console.log('DROP RESULT:', dropResult)
    },
    onCardDrop(columnId, dropResult) {
      // if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      //   const scene = Object.assign({}, this.scene)
      //   const column = scene.children.filter(p => p.id === columnId)[0]
      //   const columnIndex = scene.children.indexOf(column)
      //   const newColumn = Object.assign({}, column)
      //   newColumn.children = applyDrag(newColumn.children, dropResult)
      //   scene.children.splice(columnIndex, 1, newColumn)
      //   this.scene = scene
      // }
      console.log('Card Drop: ', columnId, ' ', dropResult)
    },
    getCardPayload(columnId) {
      // return index => {
      //   return this.scene.children.filter(p => p.id === columnId)[0].children[
      //     index
      //   ]
      // }
      console.log('get card payload:', columnId)
    },
    dragStart() {
      console.log('drag started')
    },
    log(...params) {
      console.log(...params)
    },
    convertDate(value) {
      let temp = new Date(value)
      return temp.getMonth() + '/' + temp.getDay() + '/' + temp.getFullYear()
    },
    processNode(node) {
      // recursively process child nodes
      if (node.children) {
        node.children.forEach(child => {
          this.processNode(child)
        })
      }

      // print leaf nodes URLs to console
      if (node.url) {
        //console.log(node.title, node.url, node.dateAdded)
        let item = { title: node.title, url: node.url, date: node.dateAdded }
        this.bookmarks.push(item)
      }
    },
    applyDrag(arr, dragResult) {
      const { removedIndex, addedIndex, payload } = dragResult
      if (removedIndex === null && addedIndex === null) return arr

      const result = [...arr]
      let itemToAdd = payload

      if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0]
      }

      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
      }

      return result
    },
  },
  mounted() {
    console.log(this.childrenTest)
    if (window.location.hash == '#firstinstall') {
      this.firstInstall = true
      console.log('First install here')
      chrome.bookmarks.getTree(itemTree => {
        itemTree.forEach(node => {
          this.processNode(node)
        })
        //sort items
        this.bookmarks.sort((a, b) => {
          return a.date < b.date ? 1 : b.date < a.date ? -1 : 0
        })
      })
    }
  },
}
</script>

<style lang="sass">
.hero-body{
  padding: 1rem 3rem;
}
.v-icon.v-icon {
    align-items: center;
    display: inline-flex;
    font-feature-settings: "liga";
    font-size: 24px;
    justify-content: center;
    letter-spacing: normal;
    line-height: 1;
    position: relative;
    text-indent: 0;
    transition: .3s cubic-bezier(.25,.8,.5,1),visibility 0s;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
