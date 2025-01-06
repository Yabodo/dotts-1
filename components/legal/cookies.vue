<template>
    <div class="cookie-consent">
        <vs-dialog blur not-close prevent-close v-model="show">
          <div style="margin: 1rem 0;" class="intro">
              <h2 class="title">
                  {{ $t('components.legal.cookies.title') }}
              </h2>
              <div class="disclaimer">
                  {{ $t('components.legal.cookies.description') }}
              </div>
          </div>
        <div class="list">
          <div class="header">
            {{ $t('components.legal.cookies.readMore') }}
          </div>
          <a @click="showPP = true" class="bubbleButton">
            <i class='bx bx-glasses-alt icon'></i>
            {{ $t('components.legal.cookies.readPrivacyPolicy') }}
          </a>
          <a @click="showTOS = true" class="bubbleButton">
            <i class='bx bx-paragraph icon'></i>
            {{ $t('components.legal.cookies.readTermsOfService') }}
          </a>
          <a @click="showCG = true" class="bubbleButton">
            <i class='bx bx-heart icon'></i>
            {{ $t('components.legal.cookies.readCommunityGuidelines') }}
          </a>
          <a href="https://www.cookiesandyou.com/" target=”_blank” class="bubbleButton">
            <i class='bx bx-cookie icon'></i>
            {{ $t('components.legal.cookies.readAboutCookies') }}
          </a>
        </div>
        <vs-button @click="dismiss()">
          {{ $t('components.legal.cookies.acceptAndProceed') }}
        </vs-button>
        </vs-dialog>

        <!-- Terms of service -->
        <vs-dialog class="tos" overflow-hidden not-center v-model="showTOS">
          <termsOfService />
          <template #footer>
            <vs-button block @click="showTOS = false">
              {{ $t('components.legal.cookies.closePrompt') }}
            </vs-button>
          </template>
        </vs-dialog>

        <!-- Privacy Policy -->
        <vs-dialog class="tos" overflow-hidden not-center v-model="showPP">
          <privacyPolicy />
          <template #footer>
            <vs-button block @click="showPP = false">
              {{ $t('components.legal.cookies.closePrompt') }}
            </vs-button>
          </template>
        </vs-dialog>

        <!-- Community Guidelines -->
        <vs-dialog class="tos" overflow-hidden not-center v-model="showCG">
          <communityGuidelines />
          <template #footer>
            <vs-button block @click="showCG = false">
              {{ $t('components.legal.cookies.closePrompt') }}
            </vs-button>
          </template>
        </vs-dialog>
      </div>
</template>

<script>
import termsOfService from '~/components/legal/termsOfService.vue'
import privacyPolicy from '~/components/legal/privacyPolicy.vue'
import communityGuidelines from '~/components/legal/communityGuidelines.vue'

  export default {
    components: {
      termsOfService,
      privacyPolicy,
      communityGuidelines
    },
    data() {
      return {
        show: undefined,
        showPP: false,
        showTOS: false,
        showCG: false,
        // default
        transition: 'cookie-consent-transition',
        message: 'This website uses cookies to ensure you get the best experience on our website.',
        // button
        linkLabel: 'Learn more',
        buttonLabel: 'Got it!',
        href: 'http://cookiesandyou.com',
        target: '_blank',
        rel: 'noopener',
        // cookie
        cookieName: 'cookieconsent_status',
        cookiePath: '/',
        cookieDomain: '',
        cookieExpiryDays: 365,
      }
    },
    computed: {
      cookie() {
        return !this.getCookie(this.cookieName)
      }
    },
    mounted() {
      this.show = this.cookie
    },
    methods: {
      dismiss() {
        this.show = false
        this.setCookie(this.cookieName, 1, this.cookieExpiryDays, this.cookieDomain, this.cookiePath)
      },
      getCookie(name) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)

        return parts.length !== 2 ?
          undefined :
          parts.pop().split(';').shift()
      },
      setCookie(name, value, expiryDays, domain, path) {
        const exdate = new Date()
        exdate.setDate(exdate.getDate() + (expiryDays || 365))

        const cookie = [
          `${name}=${value}`,
          `expires=${exdate.toUTCString()}`,
          `path=${(path || '/')}`
        ]

        if (domain) {
          cookie.push(`domain=${domain}`)
        }

        document.cookie = cookie.join(';')
      }
    }
  }
</script>
