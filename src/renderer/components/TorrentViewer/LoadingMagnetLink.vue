<template>
    <div>
        <p>
            <img id="logo" src="~@/assets/ajax-loader.gif" alt="loading">
            [{{infoHash}}] {{name}}
        </p>
    </div>
</template>

<script>
  export default {
    name: 'LoadingMagnetLink',
    props: {
      name: {
        type: String
      },
      infoHash: {
        type: String
      }
    }
  };
</script>

<style scoped>

</style>
