<template> 
  <div :class="{ 'view-top': true, profile: true, profile2: !yourProfile, profile3: admin }">
    <div class="profile-info box" v-if="user.value">
      <div class="info-one">
        <div class="img">
          <img :src="`${routeBack}/img/users/${user.value.avatar}`" :alt="`Avatar ${user.value.nickname}`" class="avatar">
          <div v-if="yourProfile">
            <label for="image" class="button">Subir imagen</label>
            <input type="file" id="image" accept=".jpg,.png,.jpeg*" @change="fileSelected">
          </div>
        </div>
        <div class="nickname">
          <div>
            <input type="text" v-model="user.value.nickname" placeholder="Nickname" :readonly="!yourProfile">
            <div class="error" v-if="yourProfile"><p v-if="error.value">{{error.value.nickname}}{{error.value.repeat}}</p></div>
          </div>
          <div class="likes" v-if="!admin">
            <p>{{role}}</p>
            <i class="bi bi-heart-fill"></i><p>{{user.value.likes}}</p>
          </div>
        </div>
        <input type="text" v-model="user.value.firstname" placeholder="Nombre" v-if="yourProfile">
        <div class="error" v-if="yourProfile"><p v-if="error.value">{{error.value.firstname}}</p></div>
        <input type="text" v-model="user.value.lastname" placeholder="Apellido" v-if="yourProfile">
        <div class="error" v-if="yourProfile"><p v-if="error.value">{{error.value.lastname}}</p></div>
        <input type="text" v-model="user.value.email" v-if="yourProfile" readonly>
      </div>
      <div class="info-two">
        <div v-if="!admin">
          <div v-if="yourProfile" class="socials"><i class="bi bi-instagram"></i><input type="text" class="social" v-model="user.value.instagram" placeholder="Instagram"></div>
          <div v-if="yourProfile" class="socials"><i class="bi bi-twitter"></i><input type="text" class="social" v-model="user.value.twitter" placeholder="Twitter"></div>
          <div v-if="yourProfile" class="socials"><i class="bi bi-share"></i><input type="text" class="social" v-model="user.value.other" placeholder="Página web"></div>
          <textarea v-model="user.value.bio" placeholder="Biografía" :readonly="!yourProfile"></textarea>
          <div class="social-media" v-if="!yourProfile">
            <a :href="`https://www.instagram.com/${user.value.instagram}`" target="blank" v-if="user.value.instagram!=''"><i class="bi bi-instagram"></i></a>  
            <a :href="`https://www.twitter.com/${user.value.twitter}`" target="blank" v-if="user.value.twitter!=''"><i class="bi bi-twitter"></i></a>  
            <a :href="`https://${user.value.other}`" target="blank" v-if="user.value.other!=''"><i class="bi bi-share"></i></a>  
          </div>
        </div>
        <div class="error" v-if="yourProfile"><p v-if="error.value">{{error.value.bio}}</p><p class="ok" v-if="okedit">Cambios modificados correctamente</p></div>
        <div v-if="yourProfile" class="buttons">
          <button class="button"  @click="editUser">Modificar</button> 
          <button class="button button-warning"  @click="closeUser"><router-link to="/">Borrar cuenta</router-link></button>
        </div>
      </div>
    </div>
    <div class="profile-blocks" v-if="user.value">
      <div v-if="!admin">
        <div class="title">Contribuciones</div>
        <div class="box">
          <div class="blocks-box">
            <p v-if="blocksPublished.length==0 && yourProfile==true">No tienes fragmentos publicados</p>
            <p v-if="blocksPublished.length==0 && yourProfile==false">{{user.value.nickname}} no tiene fragmentos publicados</p>
            <BlockCard v-for="(block,i) in blocksPublished" :key="i"
              :user="user.value.nickname"
              :image="block.story.image"
              :story="block.story.title"
              :active="block.story.active"
              :storyid="block.story._id"
              :blockid="block.blockid"
              :id="block._id"
              :title="block.title"
              :likes="block.likes"
            />
          </div>
        </div>
      </div>
      <div v-if="yourProfile">
        <div class="title">Pendientes de moderación</div>
        <div class="box">
          <div class="blocks-box">
            <p v-if="blocksModeration.length==0">No tienes fragmentos pendientes para moderar</p>
            <BlockCard v-for="(block,i) in blocksModeration" :key="i"
              :user="user.value.nickname"
              :image="block.story.image"
              :story="block.story.title"
              :active="block.story.active"
              :id="block._id"
              :title="block.title"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from "vue-router"
import { ref, reactive, watch, onMounted } from "vue";
import { useStore } from "vuex"
import BlockCard from "@/components/BlockCard"

export default {
  name: "UserProfile",
  components: {
    BlockCard
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const user = reactive({})
    const blocksPublished = reactive([])
    const blocksModeration = reactive([])
    const yourProfile = ref(false)
    const admin = ref(false)
    const error = reactive({})
    const role = ref("")
    const file = ref("")
    const okedit = ref(false)
    const routeBack = process.env.VUE_APP_API

    const findUser = () => {
      fetch(`${routeBack}/users/findbynickname`,{
        method: "POST",
        body: JSON.stringify({nickname: route.params.nickname}),
        headers: {"Content-type":"application/json"}
      })
        .then(resp => resp.json())
        .then(data => {
          user.value=data
          admin.value=user.value.admin
          role.value = user.value.likes <= 100 ? "Novel" : user.value.likes <= 400 ? "Experto" : "Embajador"
          if(store.state.user.nickname==user.value.nickname) {
            yourProfile.value = true
            if(admin.value==false) findBlocksModerate()
            else findBlocksModerateAdmin()
          }
          if(store.state.user.nickname!=user.value.nickname && admin.value==true) user.value = ""
          if(admin.value==false) findBlocks()
          })
    }

    const findBlocks = () => {
      fetch(`${routeBack}/blocks/findbyauthor`,{
        method: "POST",
        body: JSON.stringify({author: user.value._id}),
        headers: {"Content-type":"application/json"}
      })
        .then(resp => resp.json())
        .then(data => {
          blocksPublished.splice(0)
          data.forEach(block => blocksPublished.push(block))
          })
    }

    const findBlocksModerate = () => {
      fetch(`${routeBack}/blocks/findmoderateuser`,{
        method: "POST",
        body: JSON.stringify({author: user.value._id}),
        headers: {"Content-type":"application/json"}
      })
        .then(resp => resp.json())
        .then(data => {
          blocksModeration.splice(0)
          data.forEach(block => blocksModeration.push(block))
          })
    }
    
    const findBlocksModerateAdmin = () => {
      fetch(`${routeBack}/blocks/findmoderateadmin`,{
        method: "POST",
        headers: {"Content-type":"application/json"}
      })
        .then(resp => resp.json())
        .then(data => {
          blocksModeration.splice(0)
          data.forEach(block => blocksModeration.push(block))
          })
    }

    const fileSelected = (event) => {
      file.value = event.target.files[0]
      let fd = new FormData()
      fd.append('image', file.value)
      fd.append('avatar', `${store.state.user._id}.jpg`)
      fd.append('email', store.state.user.email)
      fd.append('_id', store.state.user._id)
      fetch(`${routeBack}/users/editavatar`,{
        method: "POST",
        body: fd
      })
        .then(resp => resp.json())
        .then(data => {
          error.value = ""
          user.value = data
          store.commit("setUser",data)
          })
    }

    const editUser = () => {
      okedit.value = false
      fetch(`${routeBack}/users/edit`,{
        method: "POST",
        body:JSON.stringify({ email: store.state.user.email, firstname: user.value.firstname, lastname: user.value.lastname, nickname: user.value.nickname, bio: user.value.bio, instagram: user.value.instagram, twitter: user.value.twitter, other: user.value.other }),
        headers: {"Content-type":"application/json"}
      })
        .then(resp=>resp.json())
        .then(data=>{
          if(data.email) {
            error.value = ""
            user.value = data
            store.commit("setUser",data)
            route.params.nickname = data.nickname
            okedit.value = true
            setTimeout(() => okedit.value = false, 6000)
          }
          else error.value = data
          })
    }

    const closeUser = () => {
      fetch(`${routeBack}/users/closeaccount`,{
        method: "POST",
        body:JSON.stringify({ email: store.state.user.email }),
        headers: {"Content-type":"application/json"}
      })
        .then(resp => resp.json())
        .then(() => {
          store.commit("setUser", {})
          router.push('/')
          })
    }

    watch(store.state, () => findUser())

    onMounted(() => {
      findUser()
    })
   
    return {
      route,
      user,
      blocksPublished,
      blocksModeration,
      yourProfile,
      admin,
      error,
      role,
      okedit,
      file,
      fileSelected,
      editUser,
      closeUser,
      routeBack
    }
  },
}
</script>

<style lang="scss" scoped>
.view-top{
  margin-top: 150px;
}
.profile{
  width: 80%;
  max-width: 800px;
  height: 590px;
  margin-top: 120px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  &-info{
    width: 36%;
  }
  &-blocks{
    width: 60%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .box{
      padding: 20px 10px;
    }
    .blocks-box{
      height: 190px;
      overflow: scroll;
      display: flex;
      justify-content: space-evenly;
      flex-wrap: wrap;
    }
  }
}
.profile2{
  margin-top: 200px;
  height: 350px;
  .profile-blocks{
    .blocks-box{
      height: 260px;
    }
  }
}
.profile3{
  margin-top: 200px;
  height: 400px;
  .profile-blocks{
    .blocks-box{
      height: 310px;
    }
  }
  .profile-info{
    flex-wrap: wrap;
  }
  .info-one{
    width: 100%;
  }
  .info-two{
    width: 100%;
    button{
      margin-top: 6px;
    }
  }
}
.avatar{
  width: 100px;
  height: 100px;
  object-fit: cover;
  object-position: center;
  box-shadow: 1px 1px 3px #cfcdcd;
}
.info-one{
  width: 100%;
  .img{
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-bottom: 10px;
    input[type="file"]{
      display: none;
    }
  }
  .nickname{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: $size2;
    input{
      width: 70%;
      font-size: $size2;
      border: none;
    }
    .likes{
      width: 100px;
      position: relative;
      i::before{
        color: $primaryColor;
        position: absolute;
        top: 36px;
      }
      p{
        text-align: center;
        margin: 0;
      }
      p:last-child{
        text-align: right;
        padding-right: 10px;
      }
    }
  }
}
.info-two{
  text-align: center;
  i::before{
    color: #dbd9d9;
  }
  .socials{
    display: flex;
    justify-content: space-between;
  }
  .social{
    margin-left: 10px;
  }
  .social-media{
    display: flex;
    justify-content: space-evenly;
    i::before{
      font-size: $size3;
    }
  }
  .buttons{
    margin-top: 6px;
    display: flex;
  }
}
input,textarea{
  margin: 4px 0;
  width: 100%;
  border: none;
}
input{
  border-bottom: 1px solid $backgroundColor;
}
textarea{
  height: 100px;
  resize: none;
}
.ok{
  color: $textColor;
}

@media (max-width: 990px){
  .profile{
    height: 100%;
    flex-direction: column;
    &-info{
      width: 100%;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
    }
    &-blocks{
      width: 100%;
      div:first-child{
        margin-bottom: 10px;
      }
      .blocks-box{
      height: 160px;
    }
    }
  }
  .info-one{
    width: 55%;
  }
  .info-two{
    width: 43%;
    button{
      margin-top: 20px;
    }
  }
  textarea{
    height: 120px;
  }
}

@media (max-width: 575px){
  .profile{
    &-info{
      display: block;
    }
    &-blocks{
      width: 100%;
    }
  }
  .info-one,.info-two{
    width: 100%;
  }
  .info-two{
    button{
      margin-top: 6px;
    }
  }
  .avatar{
    width: 80px;
    height: 80px;
  }
  textarea{
    height: 100px;
  }
}

</style>