<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SunsetEditor } from '@sunsetlearn/sunset-editor'

const theme1_style = ref(`
:root {
  color: black;
}

[contenteditable]>.active.empty::after {
  color: gray !important;
}

.components-modal-container::before {
  background-color: #616161 !important;
}

.editor-content h3 {
  color: white;
}

.editor-content .copy-button {
  color: white;
}

.divider {
  background: linear-gradient(90deg, #00000000 0%, #e8802d66, transparent 100%);
}
`)

const start_content = `
After a few months of pondering <span style="color: var(--vt-c-sunset-theme-5)">Sunset Learn</span>, our online course marketplace, we've decided to release the next milestone in this journey. This means giving anyone with technical knowledge **the power to publish and sell interactive, text-based courses, guides, tutorials and more!


We live in an age where information is more democratized than ever before. YouTube, Instagram and other visual platforms allow anyone to share visual content such as stories or entertaining clips with the world.


Platforms like Medium and X allow anyone to share short thoughts, observations, advice and more.


We want to expand on this repertoire of crowdsourced information by allowing deeper skills-based knowledge to flow as freely as social media content does.


We want to encourage creators to share what they know by allowing others to purchase creator knowledge.


Creating courses is completely **free**. We only take a 3% commission from every sale and don't ask for much else.


You are free to create at your hearts desire. Share your deep expertise on programming, game making, digital photography, digital marketing, cybersecurity, or any skills you may want to share with others.


Have fun creating, and let us know what you think!


<div class="splitter"></div>


Here is a quick tutorial to get you started:

* Create an account with us at [https://sunsetlearn.com](https://sunsetlearn.com)
* Hit the <span style="color: #146aff">Publish</span> button in your account settings.
* You can start editing content with the <i class="fa-solid fa-edit" :style="{ color: 'var(--vt-c-sunset-theme-5)' }"></i> edit button at the top right of your course dashboard.
* Edit course details such as description, overview and cost information with the <i class="fa-solid fa-gear" :style="{ color: 'var(--vt-c-sunset-theme-6)' }"></i> gear icon at the top right of your course dashboard.
* You can directly edit the title of your course in the top left of your course dashboard. It will automatically save after 5 seconds.
* You can add a new section to the current chapter by typing it in the section field once you start editing content and saving the result.
* Similarly, you can add a new chapter by typing it in the chapter field once you start editing content and saving the result.
* A chapter will delete after you delete all the corresponding sections for that chapter using the <i class="fa-solid fa-xmark" :style="{ color: 'red' }"></i> delete icon next to the section name.
* All course content can be written in [Markdown](https://www.markdownguide.org) syntax, with permissive, embedded HTML and CSS if you want full customizability.
* Uploading images can be done with the <i class="fa-solid fa-image" :style="{ color: 'var(--vt-c-sunset-theme-5)' }"></i> icon below. Once you upload your images and videos, you can click on them to copy them to the clipboard or drag and drop them into the content editor.
* If you'd like to add your own widgets or interactive, JavaScript based elements to your course content, use the <i class="fa-solid fa-clipboard" :style="{ color: 'var(--vt-c-sunset-theme-5)' }"></i> button below to add your own embeddable VueJS components. The component editor is flexible and permissible. We will sanitize and check the component code on our end via an automated process.


<div class="splitter"></div>


The following is a quick API overview of all the available, built-in components that we offer within the publishing tools.


### NoteBox


The <inline-snippet snippet="NoteBox"></inline-snippet> component will render it's contents in a colored box. This is perfect for noteworthy content and footnotes.


\`\`\`markdown

<note-box color="#3549ad">

This content will render in front of a colored background!

</note-box>

\`\`\`



<note-box color="#3549ad">

This content will render in front of a colored background!

</note-box>


* <inline-snippet snippet="color"></inline-snippet>: The background color of the notebox


### PlatformInfoBox


The <inline-snippet snippet="PlatformInfoBox"></inline-snippet> component is primarily used to present platform specific code and general information. "Platform" here is defined loosely: it could be different operating systems, photo editing applications, you name it!


\`\`\`markdown

<platform-info-box platform="Windows" :do_platform_check="true" :auto_expand="false">

This content will render within the platform info box!

</platform-info-box>

\`\`\`


<platform-info-box platform="Windows" :do_platform_check="true" :auto_expand="false">

This content will render within the platform info box!

</platform-info-box>


* <inline-snippet snippet="platform"></inline-snippet>: The platform string that shows in the header of the platform info box.
* <inline-snippet snippet="do_platform_check"></inline-snippet>: Whether to check the platform name against the browser's navigator. If the platform doesn't match what is in the browser's metadata, the platform info box is disabled
* <inline-snippet snippet="auto_expand"></inline-snippet>: Whether to auto expand the platform info box or leave it unexpanded such that only the header shows.


### InlineSnippet


The <inline-snippet snippet="InlineSnippet"></inline-snippet> component is primarily used highlight inline text. This is useful for definitions, code keywords and anything you want to call attention to. The definitions and component names in this text tutorial are all created using inline snippets!


\`\`\`markdown

<inline-snippet snippet="hello"></inline-snippet>

\`\`\`


<inline-snippet snippet="hello"></inline-snippet>


* <inline-snippet snippet="snippet"></inline-snippet>: The text snippet that you wish to highlight.


### InteractiveWidget


The <inline-snippet snippet="InteractiveWidget"></inline-snippet> component provides a simple "blueprint" like background that you can build interactive components on top of!


\`\`\`markdown

<interactive-widget :grid_spacing="15">

<h2 style="z-index: 25; position: relative; text-align: center;">This content will render in front of an interactive widget!</h2>

</interactive-widget>

\`\`\`


<interactive-widget :grid_spacing="15">

<h2 style="z-index: 25; position: relative; text-align: center;">This content will render in front of an interactive widget!</h2>

</interactive-widget>


* <inline-snippet snippet="grid_spacing"></inline-snippet>: How far apart the grid cell lines are. Longer spacing will make the individual cells bigger.


### DirectoryList


The <inline-snippet snippet="DirectoryList"></inline-snippet> component provides a simple directory listing structure view! You can list the directory structure by using [Markdown](https://www.markdownguide.org/) bulleted lists.


\`\`\`markdown

<directory-list>

* Root
  * Folder1
  * Folder2

</directory-list>

\`\`\`


<directory-list>

* Root
  * Folder1
  * Folder2

</directory-list>


### CodeWithHeading


The <inline-snippet snippet="CodeWithHeading"></inline-snippet> component provides a code file view with a heading to use for the file name. Keep in mind that the code you write within the <inline-snippet snippet="CodeWithHeading"></inline-snippet> tags will need to be in a Markdown code block if you want full syntax highlighting.


\`\`\`markdown

<code-with-heading heading="main.cpp">

    // Markdown code here

</code-with-heading>

\`\`\`


<code-with-heading heading="main.cpp">

\`\`\`cpp
int main(int argc, char *argv[])
{
    return 0;
}
\`\`\`

</code-with-heading>


* <inline-snippet snippet="heading"></inline-snippet>: The text for the file heading, usually the name of a hypothetical code file, but could be whatever you want!


### SteppableCode


The <inline-snippet snippet="SteppableCode"></inline-snippet> component is like the <inline-snippet snippet="CodeWithHeading"></inline-snippet> component, but it also provides a steppable list, where each step in the list points to some part of the code.


\`\`\`markdown

<steppable-code heading="main.cpp" :steppable_lines="[1]" :removed_lines="[3]">

    // Markdown code here

    <p class="code-step">
    First code step.
    </p>

    <p class="code-nuke">
    First code removal.
    </p>

</steppable-code>

\`\`\`


<steppable-code heading="main.cpp" :steppable_lines="[1]" :removed_lines="[3]">

\`\`\`cpp
int main(int argc, char *argv[])
{
    return 0;
}
\`\`\`

<p class="code-step">
The function signature of a C++ program.
</p>

<p class="code-nuke">
Remove the return statement.
</p>

</steppable-code>


* <inline-snippet snippet="heading"></inline-snippet>: The text for the file heading, usually the name of a hypothetical code file, but could be whatever you want!
* <inline-snippet snippet="steppable_lines"></inline-snippet>: An array of of line numbers for the lines that correspond to the steps provided.


### AdjustableImage


The <inline-snippet snippet="AdjustableImage"></inline-snippet> component allows you to add images to gifs to your content.


\`\`\`markdown
<adjustable-image src="https://c.tenor.com/3vyG_tzaHb4AAAAC/tenor.gif" :external="true" :width="300" :height="300"></adjustable-image>
\`\`\`


<adjustable-image src="https://c.tenor.com/3vyG_tzaHb4AAAAC/tenor.gif" :external="true" :width="300" :height="300"></adjustable-image>


* <inline-snippet snippet="src"></inline-snippet>: The source path of the image.
* <inline-snippet snippet="external"></inline-snippet>: Whether or not the path is an external one. If this is false, all paths are resolved relative to our internal static endpoint. This is meant for images that you upload via the course tools. In that case, the <inline-snippet snippet="src"></inline-snippet> value should just be the file name and extension.
* <inline-snippet snippet="width"></inline-snippet>: The width of the image.
* <inline-snippet snippet="height"></inline-snippet>: The height of the image.


### BannerImage


The <inline-snippet snippet="BannerImage"></inline-snippet> component is very similar to the adjustable image. The only difference is that it will stretch and crop the image, such that it forms a sort of banner where it's placed.


\`\`\`markdown

<banner-image src="https://c.tenor.com/3vyG_tzaHb4AAAAC/tenor.gif" :external="true" :max_height="100"></banner-image>

\`\`\`


<banner-image src="https://c.tenor.com/3vyG_tzaHb4AAAAC/tenor.gif" :external="true" :max_height="100"></banner-image>


* <inline-snippet snippet="src"></inline-snippet>: The source path of the image.
* <inline-snippet snippet="external"></inline-snippet>: Whether or not the path is an external one. If this is false, all paths are resolved relative to our internal static endpoint. This is meant for images that you upload via the course tools. In that case, the <inline-snippet snippet="src"></inline-snippet> value should just be the file name and extension.
* <inline-snippet snippet="max_height"></inline-snippet>: The maximum height of the banner.


### AdjustableVideo


The <inline-snippet snippet="AdjustableVideo"></inline-snippet> component allows you to add videos to your content.


\`\`\`markdown

<adjustable-video src="https://static.sunsetlearn.com/common/beach.mp4" :external="true" :width="75" :middle_align="true"></adjustable-video>

\`\`\`


<adjustable-video src=" https:/static.sunsetlearn.com/common/beach.mp4" :external="true" :width="75" :middle_align="true"></adjustable-video>


* <inline-snippet snippet="src"></inline-snippet>: The source path of the video.
* <inline-snippet snippet="external"></inline-snippet>: Whether or not the path is an external one. If this is false, all paths are resolved relative to our internal static endpoint. This is meant for videos that you upload via the course tools. In that case, the <inline-snippet snippet="src"></inline-snippet> value should just be the file name and extension.
* <inline-snippet snippet="width"></inline-snippet>: The width of the video expressed as a percent of the content pane width.
* <inline-snippet snippet="middle_align"></inline-snippet>: Whether or not to align the video horizontally in the middle of the content pane.


### Timeline


* The <inline-snippet snippet="Timeline"></inline-snippet> component shows a timeline of events in vertical form. Each separate timeline event is separated as a bulleted list. You can start each event with a year, for example, by using Markdown bold syntax. After that, within each event you can write multiple sub-events by writing each using Markdown italics syntax.


\`\`\`markdown

<timeline>

* **1000s** *Some Middle Age stuff.* *Later on after that, some more Middle Age stuff.*

* **2000s** *Smartphones.* *Cryptocurrency.* *AI.*

</timeline>

\`\`\`


<timeline>

* **1000s** *Some Middle Age stuff.* *Later on after that, some more Middle Age stuff.*

* **2000s** *Smartphones.* *Cryptocurrency.* *AI.*

</timeline>


### LateX


The <inline-snippet snippet="LateX"></inline-snippet> component allows you to write mathematical equations by leveraging the [LateX](https://en.wikipedia.org/wiki/LaTeX) format.


\`\`\`markdown

<late-x text="$\\overline{v}=(v_{x},v_{y})$" :font_size="16"></late-x>

\`\`\`


<late-x text="$\\overline{v}=(v_{x},v_{y})$" :font_size="16"></late-x>`

let sunset_editor = ref()

onMounted(async () => {
  await sunset_editor.value.import_document_string(start_content)
  setTimeout(async () => {
    await sunset_editor.value.import_document_string(start_content)
  }, 1000)
})
</script>

<template>
  <div class="top">
    <h3 class="heading" contenteditable="true">Sunset Studios</h3>
    <SunsetEditor
      ref="sunset_editor"
      asset_endpoint="https://static.sunsetlearn.com"
      :start_with_editing_enabled="false"
      :stylesheet_string="theme1_style"
      :show_text_selection_search="true"
      current_llm="mistral"
    />
  </div>
</template>

<style scoped>
.heading {
  font-size: 22pt;
  margin: 10px 0px;
  color: gray;
}
</style>
