<script lang="ts">
import axios from 'axios'
import { storeTokens, retrieveTokens } from `./argus.js`

const REFRESH_DURATION = 3*60*1000 // 3 minntes

export default {
  name: 'ArgusApp',
  data() {
    return {
      baseURL: "",
      mdr: {
        url: "",
        tokens: {
          refresh: "",
          access: "",
        },
      },
    }
  },
  created() {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('aristotle')) {
      this.baseURL = urlParams.get('aristotle')
    }
    // this.mdr = {
    //   url: urlParams.get('aristotle'),
    // }
    setInterval(this.refreshTokens, REFRESH_DURATION)

    this.init()
  },
  mounted() {
    // this.name // type: string | undefined
    // this.msg // type: string
    // this.count // type: number
    this.mdr = retrieveTokens(this.baseURL)
    window.addEventListener('message', this.keysListener);
  },
  methods: {
    keysListener: function(event) {
      this.mdr = JSON.parse(event.data)
      this.init()
      storeTokens(this.mdr)
      this.refreshTokens()
    },
    retrieveTokens: function (){
      this.mdr = retrieveTokens()
    },
    init: function() {
      console.log("No init method provided")
    },
    aristotleApi: function(api, method, data){
      return axios({
          method: method,
          url: `${this.mdr.url}${api}`,
          // url: `http://127.0.0.1:8000${api}`,
          data: data,
          headers: {'Authorization': `Bearer ${this.mdr.tokens.access}`}
      })
    },
    refreshTokens: function() {
      this.aristotleApi("/api/jwt/token/refresh/", "post", {"refresh": this.mdr.tokens.refresh}).then(
        response => {
          this.mdr.tokens.access = response.data.access
          console.log(response.data.access)
          console.log(response)
        }
      )
    }
  }
}
</script>

<style>
#app {
}
</style>
