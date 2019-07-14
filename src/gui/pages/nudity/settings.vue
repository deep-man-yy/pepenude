<template>
  <div class="nudity-settings">
    <div v-if="!isLoading" class="content-body settings-fields">
      <nudity-preview />

      <!-- Process with -->
      <section>
        <div class="field">
          <label class="label">Process with:</label>

          <div class="field">
            <input v-model="useCpu" type="checkbox" />
            CPU
            <p class="field-help">Force CPU processing. (Slower) Select this option if <strong>you do not have</strong> an NVIDIA GPU!</p>
          </div>

          <div v-for="(gpu,index) in gpuList" :key="index" class="field">
            <input v-model="useGpus" :value="index" type="checkbox" :disabled="useCpu" />
            {{ gpu.Caption || gpu.Name || gpu.Description || gpu.VideoProcessor }}
          </div>

          <div class="field">
            <input v-model="useCustomGpu" type="checkbox" :disabled="useCpu" />
            Custom GPU ID
            <p class="field-help">Select this option if you want to use a GPU that is not in the list.</p>
          </div>

          <div class="field">
            <input v-if="useCustomGpu" v-model="customGpuId" class="input" type="number" min="0" />
          </div>
        </div>
      </section>
      <!-- Processing Options -->
      <section>
        <div class="field">
          <label class="label">Processing Options:</label>

          <div class="field">
            <input v-model="enablePubes" type="checkbox" />
            Enable Pubic Hair
          </div>
        </div>
      </section>

      <!-- waifu2x -->
      <!-- WORK IN PROGRESS! -->
      <section v-if="false">
        <div v-if="!useCpu" class="field">
          <label class="label">Use waifu2x:</label>
          <input v-model="useWaifu" type="checkbox" /> Yes, why not?
          <p class="field-help">waifu2x will try to resize your transformed photo to <strong>1024x1024</strong> with the least possible quality loss. Keep in mind that as its name indicates, the program is not designed to work with real people so there may be some minor changes in your photo.</p>
        </div>
      </section>

      <div class="buttons">
        <nuxt-link to="/nudity/crop" class="button is-danger">Back</nuxt-link>
        <button class="button" @click.prevent="transform">Transform!</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="settings-loading">
      <nudity-preview />

      <h1 class="title">{{ $nudity.transformationDuration }}s</h1>

      <h1 class="title">🧜‍ Loading...</h1>

      <h3 class="subtitle">Transforming your photo with the power of your {{ deviceName }}!</h3>

      <div class="settings-cli">
        <p v-for="(line, index) in $nudity.modelPhoto.cliLines" :key="index" class="cli-line">{{ line }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'

export default {
  middleware: 'nudity',

  data: () => ({
    isLoading: false,

    useCpu: false,
    useGpus: [],
    gpuList: [],

    useCustomGpu: false,
    customGpuId: 0,

    useWaifu: false, // i feel dirty because of this variable name
    enablePubes: false,
  }),

  computed: {
    useGpusList() {
      if (this.useCpu) {
        return false
      }

      const list = this.useGpus

      if (this.useCustomGpu) {
        list.push(this.customGpuId)
      }

      return list
    },

    deviceName() {
      return this.useCpu ? 'CPU' : 'GPU'
    }
  },

  created() {
    this.fetchGpusList()
  },

  methods: {
    async fetchGpusList() {
      const gpus = await window.deepTools.getGpusList()
      this.gpuList = _.filter(gpus, { AdapterCompatibility: 'NVIDIA' })

      if (this.gpuList.length === 0) {
        this.useCpu = true
      } else {
        this.useGpus.push(0)
      }
    },

    async transform() {
      this.isLoading = true

      try {
        await this.$nudity.transform(this.useGpusList, this.useWaifu, this.enablePubes)
        this.$router.push('/nudity/results')
      } catch (error) {
        alert(error)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.nudity-settings {
  .settings-fields {
    @apply overflow-hidden overflow-y-auto;
  }

  .settings-loading {
    @apply text-center;

    .cnudity-preview {
      @apply mb-5;
    }

    .title {
      @apply font-bold text-3xl;
    }

    .subtitle {
      @apply text-gray-600 text-xl;
    }
  }

  .settings-cli {
    @apply mt-6 bg-black p-4 w-full font-mono overflow-y-auto;
    height: 150px;

    .cli-line {
      @apply block text-white;
    }
  }
  section{
    display: inline-block;
    vertical-align: top;

    width: 49%;
    margin-bottom: 30px;
  }
}
</style>
