<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <p class="title">Kwik Portal</p>
        <p class="subtitle">
          <a href="popup.html#firstinstall" target="_blank">dashboard</a>
          <input type="text" placeholder="Search..." v-model="stringSearch" @keyup.enter="searchQuery"/>
        </p>
      </div>
      <div class="nav-bar">
        <div class="home nav-bar-item">
          <span> Home </span>
        </div>
        <div class="note nav-bar-item">
          <span> Notes </span>
        </div>
        <div class="more nav-bar-item">
          <span @click="showMore = !showMore"> More </span>
          <div v-show="showMore">
            <ul class="dropdown-menu">
              <li class="dropdown-item">
                <span>Edit Mode</span>
                <label class="switch">
                  <input type="checkbox" @change="toggleEditMode" />
                  <span class="slider round"></span>
                </label>
              </li>
              <li class="dropdown-item">
                <span @click="showModal = !showModal; showMore=false">Create New List</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <div class="modal-vue" v-if="showModal">
      <div class="overlay" @click="handleClose"></div>

      <div class="modal" v-if="showModal">
        <p>Create New List</p>
        <button class="close" @click="handleClose">x</button>
        <section class="popup" v-if="showModal">
          <div class="inputName">
            <input type="text" v-model="listName" placeholder="Enter name of list"/>
          </div>
          <div class="btn-group">
            <div class="btn"><button @click="createList">Create</button></div>
            <div class="btn">
              <button @click.prevent="handleClose">Cancel</button>
            </div>
          </div>
          
        </section>
      </div>
    </div>
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
          <Draggable
            v-for="column in childrenTest"
            :key="column.id"
            style="width: 30%"
          >
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
                :drag-class="isEditMode ? 'card-ghost' : ''"
                :drop-class="isEditMode ? 'card-ghost-drop' : ''"
                :drop-placeholder="dropPlaceholderOptions"
                :lock-axis="!isEditMode ? 'x,y' : ''"
              >
                <Draggable v-for="card in column.mychilditems" :key="card.id">
                  <div class="ChildClassName" @click="goToUrl(card)">
                    <p>
                      <img
                        v-if="!isEditMode"
                        src="../assets/icons/icon_2.svg"
                      />
                      <span v-else class="column-drag-handle">&#x2630;</span
                      >{{ card.title }}
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
import {
  addBaseData,
  createDB,
  queryTable,
  insertOrUpdate,
  deleteRow,
  deleteTable,
  getListTables,
} from './database'

const databaseName = 'database'

var lib = createDB(databaseName)

export default {
  data() {
    return {
      msg: 'Text here!',
      showMore: false,
      showModal: false,
      isEditMode: false,
      stringSearch: '',
      listName: '',
      childrenTest: [
        {
          className: 'test',
          name: 'bookmarks',
          id: 'bookmarks',
          mychilditems: [],
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
  watch: {
    bookmarks(newValue,oldValue){
      console.log('newValue',newValue);
      console.log('oldValue',oldValue);
    }
  },

  methods: {
    onColumnDrop(dropResult) {
      let scene = this.applyDrag(this.childrenTest, dropResult)
      this.childrenTest = scene
      console.log('DROP RESULT:', dropResult)
    },
    onCardDrop(columnId, dropResult) {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
        const column = this.childrenTest.filter(p => p.id === columnId)[0]
        const columnIndex = this.childrenTest.indexOf(column)
        const newColumn = Object.assign({}, column)
        newColumn.mychilditems = this.applyDrag(
          newColumn.mychilditems,
          dropResult
        )
        this.childrenTest.splice(columnIndex, 1, newColumn)

        if (dropResult.removedIndex !== null) {
          const col = this.childrenTest.filter(p => p.id === columnId)[0]
          deleteRow(lib, col.name, { id: dropResult.payload.id })
        }
        if (dropResult.addedIndex !== null) {
          const col = this.childrenTest.filter(p => p.id === columnId)[0]
          let payload = {
            id: dropResult.payload.id,
            title: dropResult.payload.title,
            url: dropResult.payload.url,
            date: dropResult.payload.date,
          }
          deleteTable(lib, col.name)
          addBaseData(lib, col.name, col.mychilditems, null)
        }
      }
      console.log('Card Drop: ', columnId, ' ', dropResult)
    },
    getCardPayload(columnId) {
      console.log('get card payload:', columnId)
      return index => {
        return this.childrenTest.filter(p => p.id === columnId)[0].mychilditems[
          index
        ]
      }
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
        let item = {
          id: node.id,
          title: node.title,
          url: node.url,
          date: node.dateAdded,
        }
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
    handleClose() {
      this.showMore = false
      this.showModal = !this.showModal
    },
    toggleEditMode(event) {
      this.isEditMode = event.target.checked
      this.showMore = false
    },
    goToUrl(data) {
      if (!this.isEditMode) {
        window.open(data.url)
      }
    },
    createList() {
      this.showMore = false
      this.showModal = false
      var listData = {
        className: 'test',
        name: this.listName,
        id: this.listName,
        mychilditems: [],
      }
      this.childrenTest.push(listData)
      console.log("childrenTest", this.childrenTest)
      addBaseData(lib, this.listName, null, ['id', 'title', 'url', 'date'])
    },

     searchQuery(){
      if(this.stringSearch){
      this.stringSearch = ''
       let newBookmarks = this.bookmarks.filter(item => item.title.includes(this.stringSearch.toString()))
       return newBookmarks
       
      }else{
        return this.bookmarks;
      }
    }
  },
  mounted() {
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
        if (lib.isNew()) {
          this.childrenTest.forEach(child => {
              addBaseData(lib, 'bookmarks', this.bookmarks, null)
              child.mychilditems = this.bookmarks
          })
        } else {
          let listTableName = getListTables(databaseName)

          listTableName.forEach(table => {
            if (table == 'bookmarks') {
              this.childrenTest[0].mychilditems = queryTable(lib, 'bookmarks', {})
            } else {
              this.childrenTest.push({
                className: 'test',
                name: table,
                id: table,
                mychilditems: queryTable(lib, table, {},)
              })
            }
          })
        }
      })
    }
  },
}
</script>

<style lang="sass">
.nav-bar {
  display: flex;
  margin-left: 25px;
}
.nav-bar-item {
  padding: 5px 20px;
  cursor: pointer;
}
.nav-bar-item img {
  height: 15px;
  padding-top: 5px;
}

.dropdown-menu {
  display: block;
  background-color: white;
  left: 170px;
  min-width: 12rem;
  padding-top: 4px;
  position: absolute;
  top: 145px;
  z-index: 20;
  border: 1px solid darkgrey;
  z-index: 1000000000000;
}
.dropdown-item {
  cursor: pointer;
  border-bottom: 1px solid darkgray;
  padding: 15px;
}
.dropdown-item:last-child {
  border: none;
}
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
.ChildClassName{
  border: 1px solid rgba(0,0,0,.125);
  padding: .75rem 1.25rem;
}
.ChildClassName img {
  height: 10px;
  padding-right: 5px;
}
.switch {
  position: relative;
  display: inline-block;
  width: 45px;
  height: 20px;
  float: right;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
.popup {
  width: 100%;
  height:200px;
  color: black;

  margin: 0 auto;
  justify-content: space-around;
  position: relative;
  align-items: center;
  text-align: center;
  margin-top: 20px;
}
.popup .inputName input {
  border: 1px solid darkgray;
  color: black;
}
.popup .inputName input::placeholder {
  color: darkgray;
}
.popup .btn-group {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.popup .btn button{
  padding: 10px 25px;
  background-color:#0078d7;
  color:white;
  border-radius: 4px;
  margin: 5px;
}
#container {
  width: 100%;
  height: 100%;
  position: absolute;
  visibility: hidden;
  display: none;
  background-color: rgba(22, 22, 22, 0.5);

  &:target {
    visibility: visible;
    display: block;
  }
}

.reveal-modal {
  background: #e1e1e1;
  margin: 0 auto;
  width: 160px;
  position: relative;
  z-index: 41;
  top: 25%;
  padding: 30px;
  -webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}
.modal-vue {
    position: fixed;
    top: 200px;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 10000;
}
.modal-vue .overlay {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
}

.modal-vue .modal {
  position: relative;
  width: 300px;
  height: 200px;
  z-index: 9999;
  margin: 0 auto;
  padding: 20px 30px;
  background-color: #fff;
  display: block;
  border-radius: 4px;
  text-align: center;
}

.modal-vue .close{
  position: absolute;
  top: 10px;
  right: 10px;
}
.subtitle {
  display:flex;
  justify-content: space-between;

}
.subtitle  input {
  border:1px solid #fff;
  border-radius: 4px;
}
::placeholder {
  color: white;
  opacity: 1;
  font-size:14px;
  padding: 10px
}
input[type=text] {
  padding: 10px;
  color:white;
  font-size:14px;
}
</style>
