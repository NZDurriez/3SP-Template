document.addEventListener("DOMContentLoaded", function() {

  // Copy helper function using the Clipboard API.
  // Now accepts a second parameter: the button element.
  window.copyText = function(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      // Instead of alerting, change the button text and background temporarily.
      const originalText = button.textContent;
      const originalBg = button.style.backgroundColor;
      button.textContent = "Copied";
      button.style.backgroundColor = "#FFC107"; // yellow background
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBg || "#28a745";
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  document.getElementById("generate3SP").addEventListener("click", function() {
    const discordID = document.getElementById("discordID").value.replace(/\D/g, '') || "Nil";
    const interactionsElement = document.getElementById("interactions");
    const staffMember = document.getElementById("staffMember").value || "Nil";
    const staffRole = document.getElementById("staffRole").value || "Nil";
    const nitroSelection = document.getElementById("discordNitro");
    const hasNitro = nitroSelection && nitroSelection.value === "yes"; // "yes" means Nitro

    if (!interactionsElement) {
      console.error("Interactions element not found!");
      return;
    }

    let interactions = interactionsElement.value || "Nil";

    // Group the input text into blocks (each block represents one infraction).
    function groupInfractions(text) {
      const lines = text.split('\n');
      let blocks = [];
      let currentBlock = [];
      const isInfractionStart = (line) => {
        return /^(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)/i.test(line.trim());
      };

      for (let line of lines) {
        if (isInfractionStart(line) && currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'));
          currentBlock = [];
        }
        currentBlock.push(line);
      }
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
      }
      return blocks;
    }

    // Split into blocks and filter out any block that contains "Revoked by"
    const blocks = groupInfractions(interactions);
    const validBlocks = blocks.filter(block => !/revoked by/i.test(block));
    const validInteractions = validBlocks.join('\n\n');

    /* 
      Insert a space between an action (warn/warned, kick/kicked, ban/banned) and a following digit.
    */
    let processedInteractions = validInteractions.replace(/(warn(?:ed)?|kick(?:ed)?|ban(?:ned)?)(?=\d)/gi, '$1 ');

    // Tally occurrences in the processed text.
    let warnCount = (processedInteractions.match(/warn/gi) || []).length;
    let kickCount = (processedInteractions.match(/kick/gi) || []).length;
    let banCount = (processedInteractions.match(/ban/gi) || []).length;

    // Update the tally in the DOM.
    document.getElementById("warnCount").innerText = warnCount;
    document.getElementById("kickCount").innerText = kickCount;
    document.getElementById("banCount").innerText = banCount;

    // Clean up interactions by trimming each line.
    const cleanedInteractions = processedInteractions
      .split("\n")
      .map(line => line.trim())
      .join("\n");

    const formattedDiscordID = discordID !== "Nil" ? `<@${discordID}>` : "Nil";

    // Wrap the summary section in Discord code blocks.
    const fullOutput = `Hello ${formattedDiscordID},

The Beehive Staff have noticed that you have been involved in multiple negative interactions (Warns: ${warnCount}, Kicks: ${kickCount}, Bans: ${banCount}) on the server. It is apparent that there is a consistent breach of our server rules and guidelines, which raises concerns about the frequency of our interactions with you.

Here is a summary of your prior staff interactions:
\`\`\`
${cleanedInteractions}
\`\`\`

Due to these interactions, the Beehive Staff Team now require an immediate adjustment in your roleplay approach. Strict compliance with our server rules and guidelines is imperative.

**Three Strike Policy:**
- Strike 1: 1-Day Ban
- Strike 2: 3-Day Ban
- Strike 3: Permanent Ban

If you receive a third strike resulting in a Permanent Ban, you will have the opportunity to appeal this on our website.

**Important Notes:**
- Surveillance methods are in place even when no staff members are online.
- The timeframe for being on 3SP is not predetermined.
- Community Rule 11 always applies.

Please react with ✅ to acknowledge this message.

Kind Regards,  
${staffMember}  
${staffRole}`;

    // For non-Nitro users, split the text at a newline boundary near the midpoint.
    if (!hasNitro) {
      let midPoint = Math.floor(fullOutput.length / 2);
      let splitIndex = fullOutput.lastIndexOf("\n", midPoint);
      if (splitIndex === -1) {
        splitIndex = fullOutput.indexOf("\n", midPoint);
        if (splitIndex === -1) {
          splitIndex = midPoint;
        }
      }
      let part1 = fullOutput.substring(0, splitIndex);
      let part2 = fullOutput.substring(splitIndex);

      // Check if the first half has an unclosed code block.
      let codeBlockCount = (part1.match(/```/g) || []).length;
      if (codeBlockCount % 2 !== 0) {
         part1 = part1 + "\n```";
         part2 = "```\n" + part2;
      }
      
      document.getElementById("outputShort3SP").textContent = part1;
      document.getElementById("outputShort3SP_Part2").textContent = part2;

      // Show the two separate output containers.
      document.getElementById("shortOutputContainer").style.display = "block";
      document.getElementById("shortOutputPart2Container").style.display = "block";
      document.getElementById("fullOutputContainer").style.display = "none";
    } else {
      document.getElementById("outputFull3SP").textContent = fullOutput;
      // Show the single full output container.
      document.getElementById("fullOutputContainer").style.display = "block";
      document.getElementById("shortOutputContainer").style.display = "none";
      document.getElementById("shortOutputPart2Container").style.display = "none";
    }
  });
});
