import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // ---- Types ----
  public type BlogPost = {
    id : Text;
    title : Text;
    content : Text;
    excerpt : Text;
    publicationDate : Time.Time;
    editHistory : [EditRecord];
    embeddedImages : [EmbeddedImage];
    associatedFiles : [Storage.ExternalBlob];
  };

  public type EditRecord = {
    timestamp : Time.Time;
    editor : Principal;
    previousTitle : Text;
    previousContent : Text;
    previousExcerpt : Text;
  };

  public type EmbeddedImage = {
    id : Text;
    url : Storage.ExternalBlob;
    position : Nat;
    size : Text;
    altText : Text;
  };

  public type StoreItem = {
    id : Text;
    title : Text;
    description : Text;
    price : Nat;
    coverImage : Storage.ExternalBlob;
    productType : ProductType;
    available : Bool;
    previewImages : [Storage.ExternalBlob];
  };

  public type ProductType = {
    #eBook;
    #clothing;
    #other : Text;
  };

  public type MeetingSlot = {
    id : Text;
    startTime : Time.Time;
    durationMinutes : Nat;
    isBooked : Bool;
    description : Text;
  };

  public type Appointment = {
    id : Text;
    customerName : Text;
    timeSlotId : Text;
    bookedBy : Principal;
  };

  public type Livestream = {
    id : Text;
    title : Text;
    startTime : Time.Time;
    externalLink : Text;
    buttonLabel : Text;
    description : Text;
    visible : Bool;
    creationTimestamp : Time.Time;
  };

  public type LinkItem = {
    id : Text;
    textLabel : Text;
    url : Text;
    visible : Bool;
    order : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type SiteContent = {
    businessTitle : Text;
    blogTitle : Text;
    blogDescription : Text;
    storeItemsTitle : Text;
    storeItemsDescription : Text;
    meetingTitle : Text;
    meetingDescription : Text;
    mp3PlayerTitle : Text;
    mp3PlayerDescription : Text;
    livestreamTitle : Text;
    livestreamDescription : Text;
    linksTitle : Text;
    linksDescription : Text;
    footerContent : Text;
    showNewSection : Bool;
    showMp3PlayerSection : Bool;
    showLivestreamSection : Bool;
    showLinksSection : Bool;
  };

  public type HomepageSection = {
    id : Text;
    title : Text;
    description : Text;
    sectionType : SectionType;
    order : Nat;
    visible : Bool;
  };

  public type SectionType = {
    #blog;
    #storeItems;
    #meetings;
    #mp3Player;
    #livestream;
    #links;
    #custom : Text;
  };

  public type AnalyticsData = {
    pageVisits : [(Text, Nat)];
    elementClicks : [(Text, Nat)];
    sectionViews : [(Text, Nat)];
    dailyVisitors : [(Text, Nat)];
  };

  type DayBucket = {
    dayKey : Text;
    count : Nat;
  };

  type AnalyticsDataInternal = {
    pageVisits : Map.Map<Text, Nat>;
    elementClicks : Map.Map<Text, Nat>;
    sectionViews : Map.Map<Text, Nat>;
    mp3TrackPlays : Map.Map<Text, Nat>;
    dailyVisitors : Map.Map<Text, Nat>;
  };

  // MP3 Types
  public type Mp3Track = {
    id : Text;
    title : Text;
    artist : Text;
    duration : Nat;
    file : Storage.ExternalBlob;
    playlistId : Text;
    visible : Bool;
    order : Int;
    playCount : Nat;
  };

  public type Playlist = {
    id : Text;
    name : Text;
    order : Nat;
    visible : Bool;
  };

  // ---- Storage ----
  let blogPosts = Map.empty<Text, BlogPost>();
  let storeItems = Map.empty<Text, StoreItem>();
  let meetingSlots = Map.empty<Text, MeetingSlot>();
  let appointments = Map.empty<Text, Appointment>();
  let livestreams = Map.empty<Text, Livestream>();
  let linkItems = Map.empty<Text, LinkItem>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var siteContent : SiteContent = {
    businessTitle = "Geistige Entwicklung";
    blogTitle = "Blog";
    blogDescription = "Hier finden Sie unsere neuesten Blogbeiträge.";
    storeItemsTitle = "Store Items";
    storeItemsDescription = "Entdecken Sie unsere Produkte.";
    meetingTitle = "1-on-1 Meetings";
    meetingDescription = "Buchen Sie persönliche Beratungsgespräche.";
    mp3PlayerTitle = "MP3 Player";
    mp3PlayerDescription = "Genießen Sie unsere Musikstücke.";
    livestreamTitle = "Livestream";
    livestreamDescription = "Sehen Sie unsere Live-Events.";
    linksTitle = "Links";
    linksDescription = "Hier finden Sie nützliche Links zu externen Ressourcen.";
    footerContent = "© 2023 Unternehmen. Alle Rechte vorbehalten.";
    showNewSection = false;
    showMp3PlayerSection = false;
    showLivestreamSection = false;
    showLinksSection = false;
  };

  let homepageSections = Map.empty<Text, HomepageSection>();

  let analyticsData : AnalyticsDataInternal = {
    pageVisits = Map.empty<Text, Nat>();
    elementClicks = Map.empty<Text, Nat>();
    sectionViews = Map.empty<Text, Nat>();
    mp3TrackPlays = Map.empty<Text, Nat>();
    dailyVisitors = Map.empty<Text, Nat>();
  };

  // MP3 Player Storage
  let mp3TracksMap = Map.empty<Text, Mp3Track>();
  let playlistsMap = Map.empty<Text, Playlist>();

  // ---- Auth ----
  let accessControlState = AccessControl.initState();

  // ---- Stripe ----
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // ---- Authorization Functions ----
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // ---- User Profile Functions ----
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ---- Blog Functions ----
  public shared ({ caller }) func createBlogPost(title : Text, content : Text, excerpt : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create blog posts");
    };

    let id = title # Time.now().toText();
    let post : BlogPost = {
      id;
      title;
      content;
      excerpt;
      publicationDate = Time.now();
      editHistory = [];
      embeddedImages = [];
      associatedFiles = [];
    };

    blogPosts.add(id, post);
    id;
  };

  public shared ({ caller }) func updateBlogPost(id : Text, newTitle : Text, newContent : Text, newExcerpt : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit blog posts");
    };

    let existingPost = switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let editRecord : EditRecord = {
      timestamp = Time.now();
      editor = caller;
      previousTitle = existingPost.title;
      previousContent = existingPost.content;
      previousExcerpt = existingPost.excerpt;
    };

    let updatedPost : BlogPost = {
      existingPost with
      title = newTitle;
      content = newContent;
      excerpt = newExcerpt;
      editHistory = existingPost.editHistory.concat([editRecord]);
    };

    blogPosts.add(id, updatedPost);
  };

  public shared ({ caller }) func updateExcerpt(id : Text, newExcerpt : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update blog excerpts");
    };

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
      case (?existingPost) {
        let updatedPost : BlogPost = {
          existingPost with
          excerpt = newExcerpt;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  public shared ({ caller }) func updateBlogTitle(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update blog section title");
    };

    siteContent := {
      siteContent with
      blogTitle = title;
    };
  };

  public shared ({ caller }) func updateBlogDescription(description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update blog section description");
    };

    siteContent := {
      siteContent with
      blogDescription = description;
    };
  };

  public shared ({ caller }) func addBlogImage(blogId : Text, imageUrl : Storage.ExternalBlob, position : Nat, altText : Text, size : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add image to blog post");
    };

    let blogPost = switch (blogPosts.get(blogId)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let newImageId = Time.now().toText();
    let image : EmbeddedImage = {
      id = newImageId;
      url = imageUrl;
      position;
      size;
      altText;
    };

    let updatedPost : BlogPost = {
      blogPost with
      embeddedImages = blogPost.embeddedImages.concat([image]);
    };

    blogPosts.add(blogId, updatedPost);
    newImageId;
  };

  public shared ({ caller }) func updateBlogImage(blogId : Text, imageId : Text, position : Nat, size : Text, altText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update image details");
    };

    let blogPost = switch (blogPosts.get(blogId)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let updatedImages = blogPost.embeddedImages.map(
      func(img) {
        if (img.id == imageId) {
          { img with position; size; altText };
        } else {
          img;
        };
      }
    );

    let updatedPost : BlogPost = {
      blogPost with
      embeddedImages = updatedImages;
    };

    blogPosts.add(blogId, updatedPost);
  };

  public shared ({ caller }) func deleteBlogImage(blogId : Text, imageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete blog images");
    };

    let blogPost = switch (blogPosts.get(blogId)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let filteredImages = blogPost.embeddedImages.filter(
      func(img) {
        img.id != imageId;
      }
    );

    let updatedPost : BlogPost = {
      blogPost with
      embeddedImages = filteredImages;
    };

    blogPosts.add(blogId, updatedPost);
  };

  public shared ({ caller }) func addBlogFile(blogId : Text, file : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add files to blog post");
    };

    let blogPost = switch (blogPosts.get(blogId)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let updatedPost : BlogPost = {
      blogPost with
      associatedFiles = blogPost.associatedFiles.concat([file]);
    };

    blogPosts.add(blogId, updatedPost);
    "";
  };

  public shared ({ caller }) func deleteBlogFile(blogId : Text, _filePath : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete blog files");
    };

    let blogPost = switch (blogPosts.get(blogId)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?p) { p };
    };

    let filteredFiles = blogPost.associatedFiles.filter(
      func(_) {
        true;
      }
    );

    let updatedPost : BlogPost = {
      blogPost with
      associatedFiles = filteredFiles;
    };

    blogPosts.add(blogId, updatedPost);
  };

  public shared ({ caller }) func deleteBlogPost(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete blog posts");
    };

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
      case (?_) {
        blogPosts.remove(id);
      };
    };
  };

  // Public read access - no authentication required
  public query func getAllBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  // Public read access - no authentication required
  public query func getBlogPost(id : Text) : async ?BlogPost {
    blogPosts.get(id);
  };

  // ---- StoreItem (eBook) Functions ----
  public shared ({ caller }) func addStoreItem(title : Text, description : Text, price : Nat, coverImage : Storage.ExternalBlob, productType : ProductType, previewImages : [Storage.ExternalBlob]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add store items");
    };

    let id = title # Time.now().toText();
    let storeItem : StoreItem = {
      id;
      title;
      description;
      price;
      coverImage;
      productType;
      available = true;
      previewImages;
    };

    storeItems.add(id, storeItem);
    id;
  };

  public shared ({ caller }) func updateStoreItem(id : Text, title : Text, description : Text, price : Nat, coverImage : Storage.ExternalBlob, productType : ProductType, available : Bool, previewImages : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update store items");
    };

    let existingStoreItem = switch (storeItems.get(id)) {
      case (null) { Runtime.trap("Store item not found") };
      case (?e) { e };
    };

    let updatedStoreItem : StoreItem = {
      id;
      title;
      description;
      price;
      coverImage;
      productType;
      available;
      previewImages;
    };

    storeItems.add(id, updatedStoreItem);
  };

  // Public read access - no authentication required
  public query func getAllStoreItems() : async [StoreItem] {
    storeItems.values().toArray();
  };

  // Public read access - no authentication required
  public query func getStoreItem(id : Text) : async ?StoreItem {
    storeItems.get(id);
  };

  // ---- Meeting Slot Functions ----
  public shared ({ caller }) func addMeetingSlot(startTime : Time.Time, durationMinutes : Nat, description : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add meeting slots");
    };

    let id = startTime.toText() # durationMinutes.toText();
    let slot : MeetingSlot = {
      id;
      startTime;
      durationMinutes;
      isBooked = false;
      description;
    };

    meetingSlots.add(id, slot);
    id;
  };

  public shared ({ caller }) func updateMeetingSlot(id : Text, startTime : Time.Time, durationMinutes : Nat, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update meeting slots");
    };

    let existingSlot = switch (meetingSlots.get(id)) {
      case (null) { Runtime.trap("Meeting slot not found") };
      case (?s) { s };
    };

    let updatedSlot : MeetingSlot = {
      id;
      startTime;
      durationMinutes;
      isBooked = existingSlot.isBooked;
      description;
    };

    meetingSlots.add(id, updatedSlot);
  };

  // Public read access - no authentication required
  public query func getAvailableMeetingSlots() : async [MeetingSlot] {
    let availableSlots = List.empty<MeetingSlot>();
    for ((id, slot) in meetingSlots.entries()) {
      if (not slot.isBooked) {
        availableSlots.add(slot);
      };
    };
    availableSlots.toArray();
  };

  // Public read access - no authentication required
  public query func getAllMeetingSlots() : async [MeetingSlot] {
    meetingSlots.values().toArray();
  };

  // Public read access - no authentication required
  public query func getMeetingSlot(id : Text) : async ?MeetingSlot {
    meetingSlots.get(id);
  };

  // ---- Appointment Functions ----
  public shared ({ caller }) func bookAppointment(customerName : Text, timeSlotId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };

    let slot = switch (meetingSlots.get(timeSlotId)) {
      case (null) { Runtime.trap("Meeting slot not found") };
      case (?s) { s };
    };

    if (slot.isBooked) {
      Runtime.trap("Meeting slot is already booked");
    };

    let appointmentId = customerName # Time.now().toText();
    let appointment : Appointment = {
      id = appointmentId;
      customerName;
      timeSlotId;
      bookedBy = caller;
    };

    appointments.add(appointmentId, appointment);
    meetingSlots.add(timeSlotId, { slot with isBooked = true });
    appointmentId;
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Text) : async () {
    let appointment = switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?a) { a };
    };

    if (caller != appointment.bookedBy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only cancel your own appointments");
    };

    appointments.remove(appointmentId);

    let slot = switch (meetingSlots.get(appointment.timeSlotId)) {
      case (null) { Runtime.trap("Meeting slot not found") };
      case (?s) { s };
    };
    meetingSlots.add(appointment.timeSlotId, { slot with isBooked = false });
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all appointments");
    };

    let appts = List.empty<Appointment>();
    for ((id, appt) in appointments.entries()) {
      appts.add(appt);
    };
    appts.toArray();
  };

  public query ({ caller }) func getMyAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view appointments");
    };

    let myAppts = List.empty<Appointment>();
    for ((id, appt) in appointments.entries()) {
      if (appt.bookedBy == caller) {
        myAppts.add(appt);
      };
    };
    myAppts.toArray();
  };

  // ---- Livestream Functions ----
  public shared ({ caller }) func addLivestream(title : Text, startTime : Time.Time, externalLink : Text, buttonLabel : Text, description : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add livestreams");
    };

    let id = title # Time.now().toText();
    let livestream : Livestream = {
      id;
      title;
      startTime;
      externalLink;
      buttonLabel;
      description;
      visible = true;
      creationTimestamp = Time.now();
    };

    livestreams.add(id, livestream);
    id;
  };

  public shared ({ caller }) func updateLivestream(id : Text, title : Text, startTime : Time.Time, externalLink : Text, buttonLabel : Text, description : Text, visible : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update livestreams");
    };

    let existingLivestream = switch (livestreams.get(id)) {
      case (null) { Runtime.trap("Livestream not found") };
      case (?l) { l };
    };

    let updatedLivestream : Livestream = {
      id;
      title;
      startTime;
      externalLink;
      buttonLabel;
      description;
      visible;
      creationTimestamp = existingLivestream.creationTimestamp;
    };

    livestreams.add(id, updatedLivestream);
  };

  public shared ({ caller }) func deleteLivestream(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete livestreams");
    };

    if (not livestreams.containsKey(id)) {
      Runtime.trap("Livestream not found");
    };

    livestreams.remove(id);
  };

  // Public read access - no authentication required
  public query func getAllLivestreams() : async [Livestream] {
    let livestreamArray = livestreams.values().toArray();

    // Sort by creationTimestamp newest first
    let sortedLivestreams = livestreamArray.sort(
      func(a, b) {
        Int.compare(b.creationTimestamp, a.creationTimestamp); // Descending
      }
    );

    sortedLivestreams;
  };

  // Public read access - no authentication required
  public query func getLivestream(id : Text) : async ?Livestream {
    livestreams.get(id);
  };

  // ---- Links Functions ----
  public shared ({ caller }) func addLink(textLabel : Text, url : Text, order : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add links");
    };

    let id = textLabel # Time.now().toText();
    let link : LinkItem = {
      id;
      textLabel;
      url;
      visible = true;
      order;
    };

    linkItems.add(id, link);
    id;
  };

  public shared ({ caller }) func updateLink(id : Text, textLabel : Text, url : Text, visible : Bool, order : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update links");
    };

    let existingLink = switch (linkItems.get(id)) {
      case (null) { Runtime.trap("Link not found") };
      case (?l) { l };
    };

    let updatedLink : LinkItem = {
      existingLink with
      textLabel;
      url;
      visible;
      order;
    };

    linkItems.add(id, updatedLink);
  };

  public shared ({ caller }) func deleteLink(id : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete links");
    };

    if (not linkItems.containsKey(id)) {
      Runtime.trap("Link not found");
    };

    linkItems.remove(id);
  };

  public shared ({ caller }) func reorderLinks(newOrder : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reorder links");
    };

    let currentLinks = Map.empty<Text, LinkItem>();
    for ((id, link) in linkItems.entries()) {
      currentLinks.add(id, link);
    };

    linkItems.clear();

    var orderIndex = 0;
    for (id in newOrder.values()) {
      let link = switch (currentLinks.get(id)) {
        case (null) { Runtime.trap("Link not found in reorder") };
        case (?l) { l };
      };
      linkItems.add(id, { link with order = orderIndex });
      orderIndex += 1;
    };
  };

  // Public read access with visibility filtering
  public query ({ caller }) func getAllLinks() : async [LinkItem] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let links = List.empty<LinkItem>();
    for ((id, link) in linkItems.entries()) {
      // Admins see all links, regular users/guests see only visible links
      if (isAdmin or link.visible) {
        links.add(link);
      };
    };

    let linksArray = links.toArray();
    linksArray.sort(
      func(a, b) {
        Nat.compare(a.order, b.order);
      }
    );
  };

  // ---- Stripe Functions ----
  // Public read access - no authentication required
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // Public function for HTTP outcall transformation - no authentication required
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ---- Content & Section Management ----
  // Public read access - no authentication required
  public query func getSiteContent() : async SiteContent {
    siteContent;
  };

  public shared ({ caller }) func updateSiteContent(newContent : SiteContent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site content");
    };
    siteContent := newContent;
  };

  public shared ({ caller }) func updateBusinessTitle(newTitle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update business title");
    };
    siteContent := {
      siteContent with
      businessTitle = newTitle;
    };
  };

  // Public read access - no authentication required
  public query func getHomepageSections() : async [HomepageSection] {
    let sectionArray = homepageSections.values().toArray();
    sectionArray.sort(
      func(a, b) {
        Nat.compare(a.order, b.order);
      }
    );
  };

  public shared ({ caller }) func addHomepageSection(section : HomepageSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add homepage sections");
    };

    if (homepageSections.containsKey(section.id)) {
      Runtime.trap("Section with this ID already exists");
    };

    homepageSections.add(section.id, section);
  };

  public shared ({ caller }) func updateHomepageSection(id : Text, updatedSection : HomepageSection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update homepage sections");
    };

    if (not homepageSections.containsKey(id)) {
      Runtime.trap("Section not found");
    };

    homepageSections.add(id, updatedSection);
  };

  public shared ({ caller }) func deleteHomepageSection(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete homepage sections");
    };

    if (not homepageSections.containsKey(id)) {
      Runtime.trap("Section not found");
    };

    homepageSections.remove(id);
  };

  public shared ({ caller }) func reorderHomepageSections(newOrder : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reorder homepage sections");
    };

    let currentSections = Map.empty<Text, HomepageSection>();
    for ((id, section) in homepageSections.entries()) {
      currentSections.add(id, section);
    };

    homepageSections.clear();

    var orderIndex = 0;
    for (id in newOrder.values()) {
      let section = switch (currentSections.get(id)) {
        case (null) { Runtime.trap("Section not found in reorder") };
        case (?s) { s };
      };
      homepageSections.add(id, { section with order = orderIndex });
      orderIndex += 1;
    };
  };

  public shared ({ caller }) func toggleSectionVisibility(id : Text, visible : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle section visibility");
    };

    let section = switch (homepageSections.get(id)) {
      case (null) { Runtime.trap("Section not found") };
      case (?s) { s };
    };

    homepageSections.add(id, { section with visible });
  };

  // ---- Analytics ----
  // Public access for analytics tracking - allows all users including guests
  // Only tracks data for non-admin visitors
  public shared ({ caller }) func trackPageVisit(page : Text) : async () {
    // Return early if admin - don't track admin activity
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return;
    };

    let currentCount = switch (analyticsData.pageVisits.get(page)) {
      case (null) { 0 };
      case (?count) { count };
    };
    analyticsData.pageVisits.add(page, currentCount + 1);
  };

  // Public access for analytics tracking - allows all users including guests
  // Only tracks data for non-admin visitors
  public shared ({ caller }) func trackElementClick(element : Text) : async () {
    // Return early if admin - don't track admin activity
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return;
    };

    let currentCount = switch (analyticsData.elementClicks.get(element)) {
      case (null) { 0 };
      case (?count) { count };
    };
    analyticsData.elementClicks.add(element, currentCount + 1);
  };

  // Public access for analytics tracking - allows all users including guests
  // Only tracks data for non-admin visitors
  public shared ({ caller }) func trackSectionView(sectionId : Text) : async () {
    // Return early if admin - don't track admin activity
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return;
    };

    let currentCount = switch (analyticsData.sectionViews.get(sectionId)) {
      case (null) { 0 };
      case (?count) { count };
    };
    analyticsData.sectionViews.add(sectionId, currentCount + 1);
  };

  // Track daily visitors (bucketed by day) - Only non-admin visitors
  // Returns the resulting (dayKey, count) bucket for today
  public shared ({ caller }) func trackUniqueVisitor(_sessionId : Text) : async { dayKey : Text; count : Nat } {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return { dayKey = getCurrentDayKey(); count = 0 };
    };

    let dayKey = getCurrentDayKey();
    let currentCount = switch (analyticsData.dailyVisitors.get(dayKey)) {
      case (null) { 0 };
      case (?c) { c };
    };
    analyticsData.dailyVisitors.add(dayKey, currentCount + 1);

    { dayKey; count = currentCount + 1 };
  };

  public query ({ caller }) func getAnalyticsData() : async AnalyticsData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access analytics data");
    };

    {
      pageVisits = analyticsData.pageVisits.toArray();
      elementClicks = analyticsData.elementClicks.toArray();
      sectionViews = analyticsData.sectionViews.toArray();
      dailyVisitors = analyticsData.dailyVisitors.toArray();
    };
  };

  // Helper for current day key (days since epoch as Text)
  func getCurrentDayKey() : Text {
    let nanosPerDay : Int = 24 * 60 * 60 * 1_000_000_000;
    let currentNanos : Int = Int.abs(Time.now());
    let daysSinceEpoch : Int = currentNanos / nanosPerDay;
    daysSinceEpoch.toText();
  };

  // ---- MP3 Player Functions ----
  public shared ({ caller }) func uploadMp3Track(title : Text, artist : Text, duration : Nat, file : Storage.ExternalBlob, playlistId : Text, order : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload MP3 tracks");
    };

    let id = title # Time.now().toText();
    let track : Mp3Track = {
      id;
      title;
      artist;
      duration;
      file;
      playlistId;
      visible = true;
      order;
      playCount = 0;
    };

    mp3TracksMap.add(id, track);
    id;
  };

  public shared ({ caller }) func updateMp3Track(id : Text, title : Text, artist : Text, duration : Nat, playlistId : Text, visible : Bool, order : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update MP3 tracks");
    };

    let existingTrack = switch (mp3TracksMap.get(id)) {
      case (null) { Runtime.trap("MP3 track not found") };
      case (?t) { t };
    };

    let updatedTrack : Mp3Track = {
      existingTrack with
      title;
      artist;
      duration;
      playlistId;
      visible;
      order;
    };

    mp3TracksMap.add(id, updatedTrack);
  };

  public shared ({ caller }) func deleteMp3Track(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete MP3 tracks");
    };

    if (not mp3TracksMap.containsKey(id)) {
      Runtime.trap("MP3 track not found");
    };

    mp3TracksMap.remove(id);
  };

  public shared ({ caller }) func reorderMp3Tracks(playlistId : Text, newOrder : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reorder MP3 tracks");
    };

    var orderIndex : Int = 0;
    for (id in newOrder.values()) {
      let track = switch (mp3TracksMap.get(id)) {
        case (null) { Runtime.trap("Track not found in reorder") };
        case (?t) { t };
      };
      mp3TracksMap.add(id, { track with order = orderIndex });
      orderIndex += 1;
    };
  };

  // Public read access - no authentication required
  public query func getMp3TracksByPlaylist(playlistId : Text) : async [Mp3Track] {
    let tracks = List.empty<Mp3Track>();
    for ((id, track) in mp3TracksMap.entries()) {
      if (track.playlistId == playlistId and track.visible) {
        tracks.add(track);
      };
    };
    tracks.toArray();
  };

  // Public read access - no authentication required
  public query func getPublicPlaylists() : async [Playlist] {
    let playlists = List.empty<Playlist>();
    for ((id, pl) in playlistsMap.entries()) {
      if (pl.visible) {
        playlists.add(pl);
      };
    };
    playlists.toArray();
  };

  public shared ({ caller }) func createPlaylist(name : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create playlists");
    };

    let id = name # Time.now().toText();
    let playlist : Playlist = {
      id;
      name;
      order = 0;
      visible = true;
    };

    playlistsMap.add(id, playlist);
    id;
  };

  public shared ({ caller }) func updatePlaylist(id : Text, name : Text, order : Nat, visible : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update playlists");
    };

    let existingPl = switch (playlistsMap.get(id)) {
      case (null) { Runtime.trap("Playlist not found") };
      case (?p) { p };
    };

    let updatedPl : Playlist = {
      existingPl with
      name;
      order;
      visible;
    };

    playlistsMap.add(id, updatedPl);
  };

  // Public read access - no authentication required
  public query func getAllMp3Tracks() : async [Mp3Track] {
    mp3TracksMap.values().toArray();
  };

  // Public read access - no authentication required
  public query func getAllPlaylists() : async [Playlist] {
    playlistsMap.values().toArray();
  };

  public shared ({ caller }) func toggleMp3TrackVisibility(id : Text, visible : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update the visibility");
    };

    switch (mp3TracksMap.get(id)) {
      case (null) {
        Runtime.trap("MP3 track not found");
      };
      case (?track) {
        let updatedTrack = { track with visible };
        mp3TracksMap.add(id, updatedTrack);
      };
    };
  };

  public shared ({ caller }) func togglePlaylistVisibility(id : Text, visible : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update the visibility");
    };

    switch (playlistsMap.get(id)) {
      case (null) {
        Runtime.trap("Playlist not found");
      };
      case (?playlist) {
        let updatedPlaylist = { playlist with visible };
        playlistsMap.add(id, updatedPlaylist);
      };
    };
  };

  // ---- MP3 Play Count Functions ----
  // Public access for play count tracking - allows all users including guests
  // Only tracks data for non-admin visitors
  public shared ({ caller }) func incrementPlayCount(trackId : Text) : async () {
    // Return early if admin - don't track admin activity
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return;
    };

    let existingTrack = switch (mp3TracksMap.get(trackId)) {
      case (null) { Runtime.trap("MP3 track not found") };
      case (?track) { track };
    };

    let updatedTrack : Mp3Track = {
      existingTrack with
      playCount = existingTrack.playCount + 1;
    };

    mp3TracksMap.add(trackId, updatedTrack);

    // Update visitor-only track plays in analytics
    let currentCount = switch (analyticsData.mp3TrackPlays.get(trackId)) {
      case (null) { 0 };
      case (?c) { c };
    };
    analyticsData.mp3TrackPlays.add(trackId, currentCount + 1);
  };

  // Public read access - no authentication required
  public query func getTrackPlayCount(trackId : Text) : async Nat {
    switch (mp3TracksMap.get(trackId)) {
      case (null) { 0 };
      case (?track) { track.playCount };
    };
  };

  public query ({ caller }) func getAllTrackPlayCounts() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access play count analytics");
    };

    let playCounts = List.empty<(Text, Nat)>();
    for ((id, track) in mp3TracksMap.entries()) {
      playCounts.add((id, track.playCount));
    };
    playCounts.toArray();
  };

  public shared ({ caller }) func resetTrackPlayCount(trackId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset play count");
    };

    let existingTrack = switch (mp3TracksMap.get(trackId)) {
      case (null) { Runtime.trap("MP3 track not found") };
      case (?track) { track };
    };

    let updatedTrack : Mp3Track = {
      existingTrack with
      playCount = 0;
    };

    mp3TracksMap.add(trackId, updatedTrack);
  };

  public shared ({ caller }) func resetAllTrackPlayCounts() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset play counts");
    };

    for ((id, track) in mp3TracksMap.entries()) {
      let updatedTrack = { track with playCount = 0 };
      mp3TracksMap.add(id, updatedTrack);
    };
  };
};
