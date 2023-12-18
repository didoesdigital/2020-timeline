let timelineData;
const lockdownData = [
  {
    name: "Lockdown 1.0",
    startDate: new Date("2020", "2", "24", "6"),
    endDate: new Date("2020", "5", "1", "6"),
    description:
      "When social distancing began, we didn’t know much about the virus, such as how it spread or what precautions to take.\nIt was a difficult time.",
  }, // zero-indexed month means "2" is March and "5" is June
  {
    name: "Lockdown 2.0",
    startDate: new Date("2020", "6", "9", "6"),
    endDate: new Date("2020", "9", "28", "6"),
    description:
      "The second time around was easier and harder. We knew the drill, routines were easier, but we’d burnt through a lot more of our reserves.\nIt was 110 days.",
  }, // zero-indexed month means "6" is Jul and "9" is October
  {
    name: "Ring of Steel",
    startDate: new Date("2020", "9", "28", "6"),
    endDate: new Date("2020", "10", "8", "6"),
    description:
      "We continued to be trapped in Melbourne for another two weeks after lockdown “ended”.",
  }, // zero-indexed month means "9" is October and "10" is November
];

const backgroundColor = "#FAF9FB";

const markerDefaultColor = "#9880C2";
const markerFadedColor = "#E4DDEE";
const markerPersonalColor = "#5598E2";

const labelDefaultColor = "#331A5B";
const labelPersonalColor = "#093B72";

const annotationDefaultColor = "#E4DDEE";

const labelSeparation = 24;

const width = window.innerWidth;

function init() {
  const data = timelineData;

  const params = {};

  params["smallScreenSize"] = 768;
  params["mediumScreenSize"] = 940;

  params["svg"] = {
    width: Math.min(width, 768),
    height: data.length * 48, // Roughly relative to number of data points but doesn't factor in the full timeline scale such as clustering or spread out data
  };

  params["margin"] = {
    top: 104, //60,//104,
    right: 8, //96,
    bottom: 192,
    left: 160, //8,//240,
    axisLeft: 144,
  };

  params["plot"] = {
    x: params["margin"]["left"],
    y: params["margin"]["top"],
    width:
      params["svg"]["width"] -
      params["margin"]["left"] -
      params["margin"]["right"],
    height:
      params["svg"]["height"] -
      params["margin"]["top"] -
      params["margin"]["bottom"],
  };

  params["smallScreenMargin"] = {
    top: 60,
    right: 8,
    bottom: 192,
    left: 8,
    axisLeft: 144,
  };

  params["smallScreenPlot"] = {
    x: params["margin"]["left"],
    y: params["margin"]["top"],
    width:
      params["svg"]["width"] -
      params["margin"]["left"] -
      params["margin"]["right"],
    height:
      params["svg"]["height"] -
      params["margin"]["top"] -
      params["margin"]["bottom"],
  };

  params["marker"] = {
    radius: 4,
  };

  params["date"] = {
    offset: params["marker"]["radius"] * 2,
  };

  params["event"] = {
    offset: params["marker"]["radius"] * 6,
  };

  params["smallScreenEvent"] = {
    offset: params["marker"]["radius"] * 4,
  };

  const y = d3
    .scaleUtc()
    .domain(d3.extent(data, (d) => d.date))
    .range([params.plot.y, params.plot.height]);

  const yAxis =
    width >= params.smallScreenSize
      ? d3
          .axisRight(y)
          .tickPadding(-params.margin.left)
          .tickSizeOuter(0)
          .tickSizeInner(-params.margin.left)
      : d3
          .axisRight(y)
          .tickPadding(-params.smallScreenMargin.axisLeft)
          .tickSizeOuter(0)
          .tickSizeInner(-params.smallScreenMargin.axisLeft)
          .tickFormat(d3.timeFormat("%b"));

  const axis = { y: yAxis };

  const svg = d3
    .select("svg#timeline")
    .attr("height", params.svg.height)
    .attr("width", params.svg.width)
    .style("width", "100%")
    .attr("title", "Timeline of Melbourne in 2020");

  const chartBackground = svg
    .append("rect")
    .attr("id", "chart-background")
    .attr("fill", "var(--coolgrey-100)")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", params.svg.width)
    .attr("height", params.svg.height);

  const chartTitle = svg
    .append("g")
    .attr("class", "chart-title")
    .append("text")
    .attr("id", "title-text")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", 24)
    .attr("dy", "2em")
    .style("font-weight", "700")
    .style("font-size", "clamp(1.2rem, 4vw, 2.5rem)") // minimum, preferred, maximum
    .text("Melbourne in 2020");

  const chartSubtitle = svg
    .append("g")
    .attr("class", "chart-subtitle")
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", 24)
    .attr("dy", "5.5em")
    .style("font-weight", "400")
    .style("font-size", "clamp(1rem, 2.5vw, 1.25rem)") // minimum, preferred, maximum
    .text("One Aussie’s effort to make sense of it");

  const plot = svg
    .append("g")
    .attr("id", "plot")
    .attr(
      "transform",
      `translate(${
        width >= params.smallScreenSize
          ? params.margin.left
          : params.smallScreenMargin.left
      }, ${params.plot.y})`
    );

  const gy = plot
    .append("g")
    .attr("id", "y-axis")
    .attr("class", "axis")
    .call(axis.y)
    .attr("aria-hidden", "true")
    .call((g) => g.selectAll(".tick text").call(halo));

  const annotations = plot
    .append("g")
    .attr("class", "annotations")
    .selectAll("g")
    .data(lockdownData)
    .join("g");

  const annotationStrokeWidth = width >= params.smallScreenSize ? 3 : 8;
  const annotationsLeftMargin =
    width >= params.smallScreenSize
      ? params.plot.x + 240 + 24 + 24
      : params.svg.width - annotationStrokeWidth;

  annotations
    .append("line")
    .attr("class", "annotation-line")
    .attr("aria-hidden", "true")
    .attr("stroke", annotationDefaultColor)
    .attr("stroke-width", annotationStrokeWidth)
    .attr("x1", width >= params.smallScreenSize ? annotationsLeftMargin : 0)
    .attr("x2", width >= params.smallScreenSize ? annotationsLeftMargin : 0)
    .attr("y1", (d) => y(d.startDate))
    .attr("y2", (d) => y(d.endDate));

  annotations
    .append("text")
    .attr("x", annotationsLeftMargin + 24)
    .attr("y", (d) => y(d.startDate))
    .attr("dy", "0.7em")
    .style("font-size", 16)
    .style("font-weight", 600)
    .text((d) => (width >= params.mediumScreenSize ? d.name : ""));

  annotations
    .append("text")
    .attr("x", annotationsLeftMargin + 24)
    .attr("y", (d) => y(d.startDate))
    .attr("dy", "2.0em")
    .style("font-size", 16)
    .style("font-weight", 400)
    .text((d) =>
      width >= params.mediumScreenSize
        ? d3.timeFormat("%e %b")(d.startDate) +
          " – " +
          d3.timeFormat("%e %b")(d.endDate)
        : ""
    );

  const markers = plot
    .append("g")
    .attr("class", "markers")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("transform", (d) => `translate(0, ${y(d.date)})`)
    .attr("aria-hidden", "true")
    .attr("fill", (d) =>
      d.sharedOrPersonal === "Shared" ? markerDefaultColor : markerPersonalColor
    )
    .attr("stroke", (d) =>
      d.sharedOrPersonal === "Shared" ? markerDefaultColor : markerPersonalColor
    )
    .attr("cx", 0.5)
    .attr("cy", params.marker.radius / 2 + 0.5)
    .attr("r", params.marker.radius);

  const dodgedYValues = dodge(
    data.map((d) => y(d.date)),
    labelSeparation
  );

  const eventLabels = plot
    .append("g")
    .attr("class", "eventLabels")
    .attr("role", "list")
    .attr("aria-label", "events")
    .selectAll("text")
    .data((d) => d3.zip(data, dodgedYValues))
    .join("text")
    .attr("class", "event-title")
    .attr("tabindex", 0)
    .attr("role", "listitem")
    .style("font-weight", "400")
    .style("fill", ([d]) =>
      d.sharedOrPersonal === "Shared" ? labelDefaultColor : labelPersonalColor
    )
    .attr("x", params.smallScreenEvent.offset)
    .attr("y", ([, y]) => y)
    .attr("dy", "0.35em");

  eventLabels.append("tspan").text(([d]) => d.eventName);
  eventLabels
    .append("tspan")
    .text(
      ([d]) => `: ${d.eventDescription} ${d3.timeFormat("%A, %e %B")(d.date)}`
    )
    .style("pointer-events", "none")
    .attr("class", "sr-only");

  const byline = svg
    .append("g")
    .attr(
      "transform",
      `translate(${0}, ${params.svg.height - params.margin.bottom / 2})`
    )
    .append("text")
    .attr("id", "byline")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.5em")
    .text("Graphic by @DiDoesDigital");

  const tooltip = d3.select("div#tooltip");

  const rangeY = dodgedYValues.map((x) => x + params.plot.y);
  const rangeY0 = rangeY[0];
  const fuzzyTextHeightAdjustment = 16;

  svg.on("touchend mouseout", function (event) {
    markers
      .attr("fill", (d) =>
        d.sharedOrPersonal === "Shared"
          ? markerDefaultColor
          : markerPersonalColor
      )
      .attr("stroke", (d) =>
        d.sharedOrPersonal === "Shared"
          ? markerDefaultColor
          : markerPersonalColor
      );

    eventLabels.style("opacity", 1);
  });

  svg.on("touchmove mousemove", function (event) {
    const mouseY = d3.pointer(event, this)[1];
    const nearestEventY = rangeY.reduce((a, b) =>
      Math.abs(b - mouseY) < Math.abs(a - mouseY) ? b : a
    );
    const dodgedIndex = rangeY.indexOf(nearestEventY);
    const dataEvent = data[dodgedIndex];

    if (mouseY >= rangeY0 - fuzzyTextHeightAdjustment) {
      eventLabels.filter((d, i) => i !== dodgedIndex).style("opacity", 0.3);

      eventLabels.filter((d, i) => i === dodgedIndex).style("opacity", 1);

      markers
        .filter((d, i) => i !== dodgedIndex)
        .attr("fill", markerFadedColor)
        .attr("stroke", markerFadedColor);

      markers
        .filter((d, i) => i === dodgedIndex)
        .attr("fill", (d) =>
          d.sharedOrPersonal === "Shared"
            ? markerDefaultColor
            : markerPersonalColor
        )
        .attr("stroke", (d) =>
          d.sharedOrPersonal === "Shared"
            ? markerDefaultColor
            : markerPersonalColor
        )
        .raise();

      const maybeLockdownText = isDateInLockdown(dataEvent.date, lockdownData)
        ? ` · ${isDateInLockdown(dataEvent.date, lockdownData)}`
        : "";

      tooltip.style("opacity", 1);
      tooltip.style(
        "transform",
        `translate(${
          width >= params.smallScreenSize ? params.plot.x + 8 : 0
        }px, calc(-100% + ${nearestEventY}px))`
      );
      tooltip
        .select("#date")
        .text(
          `${d3.timeFormat("%A, %e %B")(dataEvent.date)}${maybeLockdownText}`
        );
      tooltip.select("#name").text(dataEvent.eventName);
      tooltip.select("#description").text(dataEvent.eventDescription);
    }
  });

  svg.on("touchend mouseleave", () => tooltip.style("opacity", 0));
}

function loadData() {
  const timeParser = d3.timeParse("%d %b %Y %I:%M%p");
  const rowConversionFunction = ({
    Date: date,
    Event: eventName,
    Description: eventDescription,
    SharedOrPersonal: sharedOrPersonal,
  }) => ({
    date: timeParser(date + " 06:00AM"), // adjusting to 6AM instead of midnight aligns first of month circles with axis tick markers
    eventName,
    eventDescription,
    sharedOrPersonal,
  });
  d3.csv("./data/didoesdigital-2020-timeline-data.csv", rowConversionFunction)
    .then((data) => {
      timelineData = data;
    })
    .then(() => {
      setTimeout(init(), 0);
    });
}

function updateCopyright() {
  const copy = d3.select("#copyright");
  const currentYear = new Date().getFullYear();
  copy.text(currentYear > 2023 ? `–${currentYear}` : "");
}

updateCopyright();
loadData();

// The dodge function takes an array of positions (e.g. X values along an X Axis) in floating point numbers
// The dodge function optionally takes customisable separation, iteration, and error values.
// The dodge function returns a similar array of positions, but slightly dodged from where they were in an attempt to separate them out. It restrains the result a little bit so that the elements don't explode all over the place and so they don't go out of bounds.
function dodge(
  positions,
  separation = 10,
  maxIterations = 10,
  maxerror = 1e-1
) {
  positions = Array.from(positions);

  let n = positions.length;

  if (!positions.every(isFinite)) throw new Error("invalid position");

  if (!(n > 1)) return positions;

  let index = d3.range(positions.length);

  for (let iteration = 0; iteration < maxIterations; ++iteration) {
    index.sort((i, j) => d3.ascending(positions[i], positions[j]));
    let error = 0;
    for (let i = 1; i < n; ++i) {
      let delta = positions[index[i]] - positions[index[i - 1]];
      if (delta < separation) {
        delta = (separation - delta) / 2;
        error = Math.max(error, delta);
        positions[index[i - 1]] -= delta;
        positions[index[i]] += delta;
      }
    }
    if (error < maxerror) break;
  }

  return positions;
}

function halo(text) {
  text
    .clone(true)
    .each(function () {
      this.parentNode.insertBefore(this, this.previousSibling);
    })
    .attr("aria-hidden", "true")
    .attr("fill", "none")
    .attr("stroke", backgroundColor)
    .attr("stroke-width", 24)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .style(
      "text-shadow",
      `-1px -1px 2px ${backgroundColor}, 1px 1px 2px ${backgroundColor}, -1px 1px 2px ${backgroundColor}, 1px -1px 2px ${backgroundColor}`
    );
}

function isDateInLockdown(date, lockdownData) {
  for (const { startDate, endDate, name } of lockdownData) {
    if (date >= startDate && date <= endDate) {
      return name;
    }
  }
  return false;
}
