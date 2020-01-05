<template>
    <md-card>
        <md-card-header>
            <div class="md-title">
                <img id="logo" src="~@/assets/ajax-loader.gif" alt="loading">
                {{name || "No Name"}}
            </div>
            <div class="md-subhead">[{{infoHash}}]</div>
        </md-card-header>
    </md-card>
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
