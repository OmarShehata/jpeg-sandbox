export default function DragAndDrop(
  dropZoneElement,
  callback
) {
  dropZoneElement.ondragenter = function (event) {
    event.preventDefault();
  };
  dropZoneElement.ondragover = function (event) {
    event.preventDefault();
  };
  dropZoneElement.ondragleave = function (event) {
    event.preventDefault();
  };

  dropZoneElement.ondrop = function (event) {
    event.preventDefault();
    const files = [];
    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < event.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (event.dataTransfer.items[i].kind === "file") {
          var file = event.dataTransfer.items[i].getAsFile();
          files.push(file);
        }
      }
    } else {
      files = event.dataTransfer.files;
    }

    callback(files)
    // 
  };
}