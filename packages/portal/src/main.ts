import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Global scroll-reveal directive
app.directive('reveal', {
  mounted(el: HTMLElement, binding) {
    el.classList.add('reveal')
    if (binding.value) {
      el.style.transitionDelay = `${binding.value}s`
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(el)
  },
})

app.mount('#app')
