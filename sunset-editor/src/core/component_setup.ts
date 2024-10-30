import { ShallowRef, shallowRef, defineComponent } from "vue";
import NoteBox from "../components/NoteBox.vue";
import PlatformInfoBox from "../components/PlatformInfoBox.vue";
import InlineSnippet from "../components/InlineSnippet.vue";
import DirectoryList from "../components/DirectoryList.vue";
import CodeWithHeading from "../components/CodeWithHeading.vue";
import SteppableCode from "../components/SteppableCode.vue";
import AdjustableImage from "../components/AdjustableImage.vue";
import AdjustableVideo from "../components/AdjustableVideo.vue";
import Timeline from "../components/Timeline.vue";
import LateX from "../components/LateX.vue";
import InteractiveWidget from "../components/InteractiveWidget.vue";
import BannerImage from "../components/BannerImage.vue";
import Divider from "../components/Divider.vue";

interface ComponentInfo {
  component: any;
  raw_template: string;
  insert_offset: number;
}

interface RegisteredComponentInfos {
  [key: string]: ComponentInfo;
}

const registered_component_infos: ShallowRef<RegisteredComponentInfos> =
  shallowRef({
    NoteBox: {
      component: NoteBox,
      raw_template: "<note-box>\n\n</note-box>",
      insert_offset: 14,
    },
    PlatformInfoBox: {
      component: PlatformInfoBox,
      raw_template:
        '<platform-info-box platform="Windows">\n\n</platform-info-box>',
      insert_offset: 22,
    },
    InlineSnippet: {
      component: InlineSnippet,
      raw_template: '<inline-snippet snippet=""></inline-snippet>',
      insert_offset: 19,
    },
    InteractiveWidget: {
      component: InteractiveWidget,
      raw_template:
        '<interactive-widget :grid_spacing="15">\n\n</interactive-widget>',
      insert_offset: 22,
    },
    DirectoryList: {
      component: DirectoryList,
      raw_template:
        "<directory-list>\n\n* Root/\n  * Folder1/\n  * Folder2/\n\n</directory-list>",
      insert_offset: 18,
    },
    CodeWithHeading: {
      component: CodeWithHeading,
      raw_template:
        '<code-with-heading heading="main.cpp">\n\n</code-with-heading>',
      insert_offset: 21,
    },
    SteppableCode: {
      component: SteppableCode,
      raw_template:
        '<steppable-code heading="main.cpp" :steppable_lines="[]" :removed_lines="[]">\n\n</steppable-code>',
      insert_offset: 18,
    },
    AdjustableImage: {
      component: AdjustableImage,
      raw_template:
        '<adjustable-image src="" :external="true" :width="300" :height="300"></adjustable-image>',
      insert_offset: 65,
    },
    AdjustableVideo: {
      component: AdjustableVideo,
      raw_template:
        '<adjustable-video src="" :external="true" :width="75" :middle_align="true"></adjustable-video>',
      insert_offset: 71,
    },
    BannerImage: {
      component: BannerImage,
      raw_template:
        '<banner-image src="" :external="true" :max_height="100"></banner-image>',
      insert_offset: 52,
    },
    Timeline: {
      component: Timeline,
      raw_template:
        "<timeline>\n\n* **1000s** *Some Middle Age stuff.* *Later on after that, some more Middle Age stuff.*\n\n</timeline>",
      insert_offset: 12,
    },
    LateX: {
      component: LateX,
      raw_template:
        '<late-x text="$\\overline{v}=(v_{x},v_{y})$" :font_size="16"></late-x>',
      insert_offset: 27,
    },
    Divider: {
      component: Divider,
      raw_template: "<divider></divider>",
      insert_offset: 1,
    },
  });

function register_editor_components(app: any) {
  for (const key of Object.keys(registered_component_infos.value)) {
    app.component(key, registered_component_infos.value[key].component);
  }
}

function register_external_component(app: any, name: string, component: any) {
  const comp = eval(`(${component})`);
  const comp_object = defineComponent(comp);
  app.component(name, comp_object);
}

export {
  registered_component_infos,
  register_editor_components,
  register_external_component,
};
