// LMS Video Events Test

import { getAssets, getSectionAndURL } from "../support/utils";

describe("LMS Video Events Test", () => {
  const sectionUrl = getSectionAndURL("emptyVideo")[1];
  const videoAsset = getAssets().video;

  before(() => {
    cy.lmsLoginAdmin();
    // Navigate to the courseware.
    // Triggers `video_player_ready` event.
    cy.visit(sectionUrl);

    // Wait for the video to appear and set video src and type.
    // Triggers `load_video` event.
    cy.get("video")
      .first()
      .should("exist")
      .invoke("attr", "src", videoAsset.url)
      .should("have.attr", "src", videoAsset.url)
      .invoke("attr", "type", videoAsset.content_type)
      .should("have.attr", "type", videoAsset.content_type);

    // Click video play button.
    // Triggers `play_video` event.
    cy.get("video")
      .first()
      .should("have.prop", "paused", true)
      .and("have.prop", "ended", false)
      .then(($video) => {
        $video[0].play();
      });

    // Click video speed button.
    // Triggers `speed_change_video` event.
    cy.get("video")
      .first()
      .should("have.prop", "paused", false)
      .then(($video) => {
        $video[0].playbackRate = 2;
      });

    // Seek to the first second of the video.
    // Triggers `seek_video` event.
    cy.get("video")
      .first()
      .and("have.prop", "playbackRate", 2)
      .then(($video) => {
        $video[0].currentTime = 1;
      });

    // Watch the whole 5 seconds video (in x2 speed).
    // Triggers `pause_video` and `stop_video` events.
    cy.get("video").first().should("have.prop", "ended", true);

    // Other video interactions require the video to be loaded with `window.Video()`.
    const metadata = {
      autohideHtml5: "true",
      autoplay: "false",
      captionDataDir: "",
      endTime: "",
      generalSpeed: "1.0",
      saveStateUrl: "",
      savedVideoPosition: "0",
      showCaptions: "false",
      sources: ["/asset-v1:org+number+session+type@asset+block@video.mp4"],
      speed: "1.0",
      startTime: "",
      streams: "",
      sub: "",
      transcriptAvailableTranslationsUrl: "",
      transcriptLanguage: "en",
      transcriptLanguages: { en: "English" },
      transcriptTranslationUrl: "",
      ytApiUrl: "",
      ytImageUrl: "",
      ytTestTimeout: "1500",
      ytMetadataUrl: "",
    };
    cy.get("video")
      .first()
      .invoke("attr", "data-metadata", JSON.stringify(metadata))
      .invoke("addClass", "video");

    cy.window().then((win) => {
      win.Video(".videoplayer");
      win
        .$("video")
        .first()
        // Triggers `show_transcript` event.
        .trigger("captions:show")
        // Triggers `hide_transcript` event.
        .trigger("captions:hide")
        // Triggers `video_show_cc_menu` event.
        .trigger("language_menu:show")
        // Triggers `video_hide_cc_menu` event.
        .trigger("language_menu:hide")
        // Triggers `skip_video` event.
        .trigger("skip")
        // Triggers `do_not_show_again_video` event.
        .trigger("skip", true);
    });
  });

  it("should log load_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "load_video" });
  });

  it("should log video_player_ready browser event", () => {
    cy.graylogPartialMatch({ event_type: "video_player_ready" });
  });

  it("should log play_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "play_video" });
  });

  it("should log speed_change_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "speed_change_video" });
  });

  it("should log seek_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "seek_video" });
  });

  it("should log pause_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "pause_video" });
  });

  it("should log stop_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "stop_video" });
  });

  it("should log show_transcript browser event", () => {
    cy.graylogPartialMatch({ event_type: "show_transcript" });
  });

  it("should log hide_transcript browser event", () => {
    cy.graylogPartialMatch({ event_type: "hide_transcript" });
  });

  it("should log video_show_cc_menu browser event", () => {
    cy.graylogPartialMatch({ event_type: "video_show_cc_menu" });
  });

  it("should log video_hide_cc_menu browser event", () => {
    cy.graylogPartialMatch({ event_type: "video_hide_cc_menu" });
  });

  it("should log skip_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "skip_video" });
  });

  it("should log do_not_show_again_video browser event", () => {
    cy.graylogPartialMatch({ event_type: "do_not_show_again_video" });
  });
});
