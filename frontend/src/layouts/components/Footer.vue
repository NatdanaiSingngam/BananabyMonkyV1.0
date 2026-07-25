<template>
  <div class="flex flex-col md:flex-row items-center justify-between gap-2 px-6 py-3 text-gray-600 text-sm bg-gray-100">
    <span class="flex items-center mb-2 md:mb-0">
      {{ $t('footer.copyright', { year: new Date().getFullYear() }) }}
    </span>
    <span class="flex items-center ml-auto">
      {{ $t('footer.craftedBy') }}
      <v-icon icon="ri-shield-check-line" color="blue" size="20" class="!mx-1" />
      <a href="https://bananabymonky.pages.dev" target="_blank" rel="noopener noreferrer" class=" hover:underline ml-1">Banana by Monky</a>
    </span>
  </div>
</template>
