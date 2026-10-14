import test from "node:test";
import assert from "node:assert/strict";
import { parseVideoUrl } from "../../src/lib/video.ts";

const id = "aB0_12-xyZ9";
test("video supports every documented YouTube URL shape with privacy embeds", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=" + id,
    "https://youtube.com/watch?feature=share&v=" + id + "&t=12#x",
    "https://youtu.be/" + id + "?t=12",
    "https://www.youtube.com/embed/" + id,
    "https://www.youtube.com/shorts/" + id,
    "https://m.youtube.com/watch?v=" + id,
  ])
    assert.deepEqual(
      parseVideoUrl(url),
      { provider: "youtube", id, embedUrl: "https://www.youtube-nocookie.com/embed/" + id },
      url,
    );
});
test("video supports both Vimeo shapes with do-not-track embeds", () => {
  for (const url of [
    "https://vimeo.com/123456789",
    "https://vimeo.com/123456789?share=copy",
    "https://player.vimeo.com/video/123456789",
  ]) {
    assert.deepEqual(
      parseVideoUrl(url),
      {
        provider: "vimeo",
        id: "123456789",
        embedUrl: "https://player.vimeo.com/video/123456789?dnt=1",
      },
      url,
    );
  }
});
test("video rejects invalid ids and missing ids", () => {
  for (const bad of [
    "",
    "short",
    "a".repeat(10),
    "a".repeat(12),
    "abcdefghi!j",
    "abcdefghi.j",
    "abcdefghiéj",
  ]) {
    for (const prefix of [
      "https://youtu.be/",
      "https://www.youtube.com/watch?v=",
      "https://www.youtube.com/embed/",
      "https://www.youtube.com/shorts/",
      "https://m.youtube.com/watch?v=",
    ])
      assert.equal(parseVideoUrl(prefix + bad), null, prefix + bad);
  }
  for (const url of [
    "https://vimeo.com/",
    "https://vimeo.com/abc",
    "https://vimeo.com/123abc",
    "https://player.vimeo.com/video/-123",
    "https://player.vimeo.com/video/12.5",
    "https://youtube.com/watch",
  ])
    assert.equal(parseVideoUrl(url), null, url);
});
test("video rejects unrelated URLs, lookalike hosts and unsupported paths", () => {
  for (const url of [
    "",
    "not a URL",
    "/watch?v=" + id,
    "//youtu.be/" + id,
    "javascript:alert(1)",
    "https://example.org/" + id,
    "https://youtube.com.evil.example/watch?v=" + id,
    "https://evilyoutube.com/watch?v=" + id,
    "https://youtu.be.evil.example/" + id,
    "https://vimeo.com.evil.example/123",
    "https://youtube.com/playlist?list=" + id,
    "https://vimeo.com/channels/staffpicks",
  ])
    assert.equal(parseVideoUrl(url), null, url);
});
