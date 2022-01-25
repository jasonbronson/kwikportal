<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <p class="title">My Options Page</p>
        <p class="subtitle">
          OPTIONS PAGE
        </p>
      </div>
    </section>
    <section>
      <h1>{{ msg }}</h1>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Welcome!',
    }
  },
}
</script>

<style lang="sass"></style>
